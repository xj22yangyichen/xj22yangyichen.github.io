## Project overview

STLite is a container implementation project I developed for CS1951 (Data Structures) at Shanghai Jiao Tong University. It implements `vector`, `map`, `priority_queue`, `deque`, and `list` against specified interfaces, with accompanying test data.

Using a container usually means focusing on the results of insertion, deletion, and access. Implementing one also requires deciding when objects are constructed and destroyed, where iterators point, and whether the existing state remains valid after an operation fails. STLite brings these normally hidden concerns to the center of the implementation.

## Five containers, five storage structures

| Container      | Structure used                                           | Main concerns                                            |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| vector         | Contiguous memory with start, end, and capacity pointers | Growth, element relocation, and object lifetimes         |
| map            | Red-black tree                                           | Ordered lookup, rotations, and insertion/deletion repair |
| priority_queue | Binomial heap                                            | Heap merging and comparator exceptions                   |
| deque          | Block pointer table with segmented storage               | Random access across blocks and operations at both ends  |
| list           | Doubly linked list                                       | Node links and iterator traversal                        |

These structures offer similar interfaces but have different performance characteristics. A contiguous array supports random access, while insertion in the middle requires moving elements. A linked list can update links directly, but cannot locate an arbitrary node through an index alone. Implementing the containers connects each interface to the constraints of its underlying structure.

## vector and deque: separating memory from objects

The template parameter `T` does not necessarily have a default constructor. Constructing an entire array of objects merely to reserve capacity would impose an unnecessary requirement on the element type. The implementation uses raw memory allocation, placement new, and explicit destruction to distinguish allocated storage from the live objects within it.

The `vector` implementation uses three pointers to track the start of allocated storage, the end of live elements, and the end of capacity. Growth and insertion must arrange element positions while pairing construction with destruction, so that uninitialized storage is never treated as a live element.

The `deque` implementation uses segmented storage with a block size of 64 and a pointer table to locate the blocks. Its iterators retain the current element, block boundaries, and position in the pointer table. Moving across blocks converts an offset into a block displacement and an offset within that block. Moving backward requires particular care with negative offsets and division.

## map: keeping tree structure consistent with iteration

Each `map` node stores its parent, left and right children, key-value pair, and color. Insertion and deletion maintain red-black tree invariants, while rotations change local links without changing the in-order sequence of keys.

The container must also support ordered traversal. Incrementing and decrementing an iterator relies on parent-child relationships, and boundary behavior must agree with the header-node design. Tree balancing and iterator behavior are therefore closely connected: after a local update, parent links and boundary positions must remain usable. Copying a container also requires copying the entire tree so that the two containers do not share mutable nodes.

## priority_queue: merging and recovery after exceptions

The priority queue uses a binomial heap. Each node stores its degree and pointers to its parent, child, and sibling. Merging first organizes the root list, then links trees of the same degree. Alongside insertion and removal, the container supports `merge` between two queues.

Because the comparator can throw, pointer updates must be designed with recovery in mind. The implementation uses `NodeBackup` and `RollbackLog` to save the links and degrees of modified nodes and restore them on the exception path.

This mechanism handles comparator exceptions by recording node relationships before they change and restoring them in reverse order when an exception occurs. Structural updates and exception handling are part of the same operation.

## Validation and project value

Container validation covers empty containers, operations at either end, independent changes after copying, element types without default constructors, and state after comparator exceptions. These cases connect interface semantics, object lifetimes, and data-structure invariants.

The project's value lies in turning abstract interfaces into concrete properties that can be checked: who owns the memory, which objects have been constructed, whether tree or list links are valid, and whether iterators still meet the interface contract. These same concerns determine the reliability of custom containers used in larger systems.
