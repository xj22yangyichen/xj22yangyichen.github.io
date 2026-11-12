## Project overview

Bookstore is a bookstore management system I developed for CS1953 (Programming) at Shanghai Jiao Tong University. Its command-line interface brings together account permissions, book management, inventory transactions, and logging. The central challenge is coordinating these operations with a storage layer that keeps the main dataset on disk.

The system serves visitors, customers, staff, and the store manager, with permission levels of 0, 1, 3, and 7 respectively. Customers can search for and purchase books; staff can update book information and restock inventory; the manager can also administer accounts and inspect financial and staff activity records. Parsed commands are dispatched to the appropriate module. Invalid input or operations that fail business checks return `Invalid`.

## From commands to business modules

The code separates parsing, accounts, books, logs, and file storage. The entry point reads commands, the parser extracts their arguments, and the business layer checks permissions and updates state. Underneath, `MemoryRiver` and `BlockList` handle file access.

The account system uses a login stack. Each login pushes a new session, and logging out restores the previous one. Each session also retains its selected book, so both the account identity and the current editing context are restored together. This supports nested sessions within the command-line interface.

Book records and search indexes are stored separately. Complete records are located by their file positions, while ISBN, title, author, and keyword each have their own index. A query first finds the record positions, then reads the corresponding books. Keywords are split into individual index entries, allowing the same book to be found through different keywords. The `show` command accepts one filtering criterion at a time.

## Organizing disk storage with an unrolled linked list

The underlying ordered structure is an unrolled linked list. Each data block has space for 500 records. An index node stores the block's maximum record, its file position, and the position of the next index node. Insertion follows the index chain to the target block, inserts the record in order, and splits the block when it reaches the split threshold. The latter half moves to a new block, after which the links and boundary records are updated.

Ordering is maintained at two levels: records are sorted within each block, and blocks are ordered by their record ranges. Grouping records into blocks lets one read retrieve multiple records instead of treating every record as an individual file node. Operations involve moving elements within a block and traversing the index chain to locate the target block.

The indexes themselves are also accessed through `MemoryRiver`, with `max_record` serving as the boundary. This file-based structure encapsulates record lookup, operations within a block, and splitting in one template, providing a shared indexing interface for ISBN, title, author, and keyword.

## What a book update involves

Changing a title or author requires more than updating the book record. The old index entry must be removed, a new entry inserted, and the record updated. Changing keywords also involves handling multiple index entries for a single book. Keeping records and indexes consistent is a central part of the implementation.

Inventory and finance are similarly connected. A purchase reduces stock and records revenue, while restocking increases stock and records expenditure. The logging module organizes these operations into financial and staff activity records. The business layer therefore maintains relationships between several data objects as well as validating individual commands.
