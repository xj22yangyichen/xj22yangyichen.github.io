## Project overview

Ticket System is a command-line train ticket management system written in C++, developed for CS1951 (Data Structures) at Shanghai Jiao Tong University. It organizes its features around finding, buying, and refunding tickets, alongside user accounts, train services, and order management.

Users can search for direct or single-transfer journeys by departure station, destination, and date, compare travel time, fares, and available seats, and then purchase tickets. When seats are unavailable, they can join a waitlist. A refund releases seats and triggers a check of pending orders so that eligible requests can be fulfilled. Users can also view their order history and order statuses.

Train management maintains routes, stops, schedules, fares, and operating date ranges. Underneath, a custom B+ tree stores users, trains, seat availability, and orders in files, while caches reduce repeated reads. The business workflows and storage structures together form the system.

## Connecting business operations to disk storage with B+ trees

The system uses custom B+ trees to store its main business data. Different keys provide access paths for different operations, with full records and auxiliary indexes working together:

| Data              | Index key                          | Purpose                                                 |
| ----------------- | ---------------------------------- | ------------------------------------------------------- |
| Trains            | Train ID                           | Retrieve routes, schedules, and fares                   |
| Station stops     | Station name                       | Find trains and the station's position on each route    |
| Seat availability | Train ID and origin departure date | Store remaining seats on each segment of a specific run |
| Orders            | Timestamp                          | Locate an order record                                  |
| User orders       | Username                           | Retrieve the user's order timestamps                    |
| Waitlist          | Train ID and origin departure date | Find pending orders for a specific run                  |

The B+ tree module maintains a node cache, while the business layer caches train and station query results. These caches operate at different levels: storage nodes and business objects. Updating records requires coordinating data in files with state already loaded into memory.

## Seat availability by segment and operating date

For a route through A, B, C, and D, seats are tracked separately for A–B, B–C, and C–D. A ticket from A to C occupies seats on the first two segments. The number of tickets available for that journey is the minimum of the remaining seats on those segments. A purchase reduces the count on each segment, and a refund adds it back.

The boarding date supplied by the user is not always the date the train left its origin. A train may cross midnight before reaching the boarding station. The system therefore converts the boarding date to the train's origin departure date before locating the correct seat record. Minute offsets and date conversion keep the timetable and seat inventory associated with the same train run.

## Direct and single-transfer searches

A direct search uses station indexes to identify candidate trains, checks station order and operating dates, and calculates departure and arrival times, the fare, and seat availability. Results can be ordered by total travel time or price, with train IDs used to resolve ties.

A single-transfer search combines two train services. In addition to finding a common transfer station, it must determine a feasible departure date for the second leg. A departure time earlier in the day than the first train's arrival may still provide a valid connection on the following day, provided it remains within the operating date range.

Comparisons therefore use complete dates and times. Comparing only times of day could miss overnight connections or incorrectly accept a train that has already departed. Station matching, connections across dates, and result ordering are integrated into the single-transfer search workflow.

## Waitlists and refunds as state transitions

Orders have three states: `SUCCESS`, `PENDING`, and `REFUNDED`. When seats are available, a purchase reduces inventory and creates a successful order. If seats are insufficient and the user accepts waitlisting, the order becomes pending and is added to the waitlist index for that train and origin departure date.

Refunding a successful order restores seats on the affected segments, then scans the waitlist for that train run. Each pending order is checked against its own journey segments. If enough seats are available, the system deducts them and marks the order successful. An order that cannot be fulfilled stays pending; later orders may still succeed because they cover different segments.

Refunding a pending order removes it from the waitlist index and marks it refunded, without releasing seats it never occupied. Keeping these two refund paths distinct is essential to maintaining consistency between orders and seat inventory.
