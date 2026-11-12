## Project overview

Raft-PPCA-2026 is a project I developed for CS1952, Principle and Practice of Computer Algorithms (PPCA), at Shanghai Jiao Tong University. Based on the framework for MIT 6.5840 Labs 2 and 3, it implements core Raft consensus logic in Go and builds a simple key-value service on top.

The lab framework supplies most of the RPC simulation, encoding utilities, and testing infrastructure. My implementation centers on `raft.go` and the key-value service's `common.go`, `client.go`, and `server.go`. The core task is to make multiple nodes agree on an order of operations and pass that order to a state machine for execution.

## Elections: using terms to govern role changes

Each Raft node transitions between Follower, Candidate, and Leader. It maintains its current term, vote, and log. After an election timeout, it starts an election and sends RequestVote requests to obtain a majority. Voting depends on both the term and whether the candidate's log is sufficiently up to date.

Terms also help handle asynchronous responses. By the time a reply to an earlier request arrives, the node may have entered a new term or lost its leadership. The code checks the role and term again before processing these responses, preventing stale replies from changing the current state. On encountering a higher term, it updates its state and becomes a Follower.

## Log replication: from receipt to commitment

The Leader maintains `NextIndex` and `MatchIndex` for each replica: the position to send next and the last position confirmed to match. AppendEntries includes the preceding entry's index and term, allowing the Follower to check that the logs connect before processing subsequent entries.

A conflict response provides a conflict term and index. The Leader uses this information to adjust the starting point of its next replication attempt, reducing the need to backtrack one entry at a time. When handling successful responses, it also ensures that an older response cannot move confirmed replication progress backward.

Receiving a log entry and making it available to the application are separate stages. The `advanceCommitIndex` function advances the commit position based on a majority of replicas' matching progress, requiring the entry used to advance it to belong to the current term. The `logApplier` then sends committed but unapplied entries to `applyCh` in order.

## What persistence saves

The `persist` function uses the lab's encoding utilities to save the current term, vote, and log. At startup, `readPersist` restores them. These fields allow a node to retain its voting and log history across a simulated restart.

State is saved through the framework's `Persister` abstraction, separating consensus logic from the underlying storage mechanism. Encoding, saving, decoding, and restoration together form the node's recovery path.

## The key-value service: placing requests in the replicated log

The service supports Get, Put, and Append. A request first calls `Raft.Start`. If the node is not the Leader, it returns the corresponding error. Otherwise, the handler creates a notification channel for the log index and waits for the state machine to apply the operation.

Get requests also go through the log. Reads therefore participate in the same ordering as writes, rather than reading directly from an arbitrary replica's local map. After receiving a notification, the handler checks the client ID and request sequence number to ensure that the log position still corresponds to the original request after any role changes.

Network retries may deliver the same write request more than once. The service records applied writes using client IDs and increasing sequence numbers. A duplicate request does not execute Put or Append again, but its waiting handler can still receive a notification. This is particularly important for Append, where retrying after a timeout could otherwise append the same text twice.
