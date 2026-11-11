const projectEntries = [
  {
    slug: "bookstore",
    date: "2025-12-04",
    name: "Bookstore",
    nameZh: "书店管理系统",
    subtitle: "基于外存的书店管理系统",
    summary:
      "从账户权限、图书索引到库存与财务，使用块状链表组织文件中的有序数据。",
    course: "CS1953 · 程序设计",
    tags: ["C++", "块状链表", "文件存储"],
    repository: "https://github.com/xj22yangyichen/Bookstore",
  },
  {
    slug: "stlite",
    date: "2026-03-30",
    name: "STLite",
    nameZh: "STLite 容器库",
    subtitle: "从零实现 C++ 容器",
    summary:
      "实现五种 STL 风格容器，探索内存管理、迭代器、红黑树、二项堆与异常安全。",
    course: "CS1951 · 数据结构",
    tags: ["C++", "泛型编程", "数据结构"],
    repository: "https://github.com/xj22yangyichen/STLite",
  },
  {
    slug: "ticket-system",
    date: "2026-06-06",
    name: "Ticket System",
    nameZh: "火车票管理系统",
    subtitle: "支持车票查询、购票候补与退票的命令行系统",
    summary:
      "使用 C++ 实现用户与车次管理、直达和换乘查询，以及购票、候补、订单查询和退票；通过自制 B+ 树在文件中存储业务数据。",
    course: "CS1951 · 数据结构",
    tags: ["C++", "B+ 树", "业务建模"],
    repository: "https://github.com/xj22yangyichen/Ticket-System",
  },
  {
    slug: "raft",
    date: "2026-07-07",
    name: "Raft",
    nameZh: "Raft 共识与键值服务",
    subtitle: "从共识算法到键值服务",
    summary:
      "基于 MIT 6.5840 实验框架，实现选举、日志复制、状态持久化与简易键值服务。",
    course: "CS1952 · 算法原理与实践",
    tags: ["Go", "分布式系统", "Raft"],
    repository: "https://github.com/xj22yangyichen/Raft-PPCA-2026",
  },
] as const;

// ISO dates sort chronologically; use the slug to break ties consistently.
export const projects = [...projectEntries].sort(
  (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
);

export type Project = (typeof projects)[number];

export function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
