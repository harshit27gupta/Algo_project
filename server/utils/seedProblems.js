import mongoose from 'mongoose';
import 'dotenv/config';
import Problem from '../models/Problem.js';
import User from '../models/User.js';

const testProblems = [
    {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        rating: 1200,
        categories: ["Array", "Hash Table", "Two Pointers"],
        timeLimit: 2000,
        memoryLimit: 512,
        constraints: [
            "2 ≤ n ≤ 10^4",
            "-10^9 ≤ nums[i] ≤ 10^9",
            "-10^9 ≤ target ≤ 10^9"
        ],
        publicTestCases: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
            }
        ],
        hiddenTestCases: [
            {
                input: "nums = [3,3], target = 6",
                output: "[0,1]"
            },
            {
                input: "nums = [1,2,3,4,5,6,7,8,9,10], target = 19",
                output: "[8,9]"
            },
            {
                input: "nums = [0,4,3,0], target = 0",
                output: "[0,3]"
            },
            {
                input: "nums = [2,5,5,11], target = 10",
                output: "[1,2]"
            },
            {
                input: "nums = [1000000000, -1000000000], target = 0",
                output: "[0,1]"
            },
            {
                input: "nums = [2,7,11,15,1,8], target = 9",
                output: "[0,1]"
            }
        ],
        isPublished: true,
        starterCode: {
            cpp: `#include <vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    \n}`,
            javascript: `function twoSum(nums, target) {\n  \n}`,
            java: `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
            c: `#include <stdlib.h>\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n    *returnSize = 0;\n    return NULL;\n}`
        },
        functionSignature: {
            cpp: "vector<int> twoSum(vector<int>& nums, int target)",
            javascript: "function twoSum(nums, target) {",
            java: "public int[] twoSum(int[] nums, int target)",
            c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize)"
        },
        functionName: "twoSum",
        customTestCaseInputTemplate: "nums=[], target="
    },
    {
        title: "Add Two Numbers",
        description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        difficulty: "Medium",
        rating: 1600,
        categories: ["Linked List", "Math"],
        timeLimit: 2000,
        memoryLimit: 512,
        constraints: [
            "1 ≤ length of l1, l2 ≤ 100",
            "0 ≤ l1[i], l2[i] ≤ 9"
        ],
        publicTestCases: [
            {
                input: "l1 = [2,4,3], l2 = [5,6,4]",
                output: "[7,0,8]",
                explanation: "342 + 465 = 807"
            }
        ],
        hiddenTestCases: [
            {
                input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
                output: "[8,9,9,9,0,0,0,1]"
            },
            {
                input: "l1 = [0], l2 = [0]",
                output: "[0]"
            },
            {
                input: "l1 = [2,4,9], l2 = [5,6,4,9]",
                output: "[7,0,4,0,1]"
            },
            {
                input: "l1 = [1,8], l2 = [0]",
                output: "[1,8]"
            },
            {
                input: "l1 = [9], l2 = [1,9,9,9,9,9,9,9,9,9]",
                output: "[0,0,0,0,0,0,0,0,0,0,0,1]"
            },
            {
                input: "l1 = [5], l2 = [5]",
                output: "[0,1]"
            },
            {
                input: "l1 = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], l2 = [5,6,4]",
                output: "[6,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]"
            }
        ],
        isPublished: true,
        starterCode: {
            cpp: `#include <vector>\nusing namespace std;\nvector<int> addTwoNumbers(vector<int>& l1, vector<int>& l2) {\n    \n}`,
            javascript: `function addTwoNumbers(l1, l2) {\n  \n}`,
            java: `public class Solution {\n    public int[] addTwoNumbers(int[] l1, int[] l2) {\n        \n    }\n}`,
            c: `#include <stdlib.h>\nint* addTwoNumbers(int* l1, int l1Size, int* l2, int l2Size, int* returnSize) {\n    \n    *returnSize = 0;\n    return NULL;\n}`
        },
        functionSignature: {
            cpp: "vector<int> addTwoNumbers(vector<int>& l1, vector<int>& l2)",
            javascript: "function addTwoNumbers(l1, l2) {",
            java: "public int[] addTwoNumbers(int[] l1, int[] l2)",
            c: "int* addTwoNumbers(int* l1, int l1Size, int* l2, int l2Size, int* returnSize)"
        },
        functionName: "addTwoNumbers",
        customTestCaseInputTemplate: "l1=[], l2=[]"
    },
    {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Hard",
        rating: 1900,
        categories: ["String", "Sliding Window", "Hash Table"],
        timeLimit: 3000,
        memoryLimit: 1024,
        constraints: [
            "1 ≤ s.length ≤ 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        publicTestCases: [
            {
                input: "s = 'abcabcbb'",
                output: "3",
                explanation: "The answer is 'abc', with the length of 3."
            },
            {
                input: "s = 'bbbbb'",
                output: "1",
                explanation: "The answer is 'b', with the length of 1."
            }
        ],
        hiddenTestCases: [
            {
                input: "s = 'pwwkew'",
                output: "3"
            },
            {
                input: "s = 'dvdf'",
                output: "3"
            },
            {
                input: "s = 'abba'",
                output: "2"
            },
            {
                input: "s = 'a'",
                output: "1"
            },
            {
                input: "s = 'abcabcbb'",
                output: "3"
            },
            {
                input: "s = 'bbtablud'",
                output: "6"
            },
            {
                input: "s = 'tmmzuxt'",
                output: "5"
            }
        ],
        isPublished: true,
        starterCode: {
            cpp: `#include <string>\nusing namespace std;\nint lengthOfLongestSubstring(string s) {\n    \n}`,
            javascript: `function lengthOfLongestSubstring(s) {\n  \n}`,
            java: `public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}`,
            c: `#include <string.h>\nint lengthOfLongestSubstring(char* s) {\n    \n}`
        },
        functionSignature: {
            cpp: "int lengthOfLongestSubstring(string s)",
            javascript: "function lengthOfLongestSubstring(s) {",
            java: "public int lengthOfLongestSubstring(String s)",
            c: "int lengthOfLongestSubstring(char* s)"
        },
        functionName: "lengthOfLongestSubstring",
        customTestCaseInputTemplate: "s="
    },
    {
        title: "Binary Tree Level Order Traversal",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        difficulty: "Medium",
        rating: 1500,
        categories: ["Tree", "Breadth-First Search"],
        timeLimit: 2000,
        memoryLimit: 512,
        constraints: [
            "0 ≤ number of nodes ≤ 2000",
            "-1000 ≤ Node.val ≤ 1000"
        ],
        publicTestCases: [
            {
                input: "root = [3,9,20,null,null,15,7]",
                output: "[[3],[9,20],[15,7]]",
                explanation: "Level 1: [3], Level 2: [9,20], Level 3: [15,7]"
            }
        ],
        hiddenTestCases: [
            {
                input: "root = [1]",
                output: "[[1]]"
            },
            {
                input: "root = []",
                output: "[]"
            },
            {
                input: "root = [1,2,3,4,5,null,7]",
                output: "[[1],[2,3],[4,5,7]]"
            },
            {
                input: "root = [3,9,20,null,null,15,7]",
                output: "[[3],[9,20],[15,7]]"
            },
            {
                input: "root = [1,2,2,3,4,4,3]",
                output: "[[1],[2,2],[3,4,4,3]]"
            },
            {
                input: "root = [1,null,2,3]",
                output: "[[1],[2],[3]]"
            },
            {
                input: "root = [1,2,3,4,null,null,5]",
                output: "[[1],[2,3],[4,5]]"
            }
        ],
        isPublished: true,
        starterCode: {
            cpp: `#include <vector>\nusing namespace std;\nvector<vector<int>> levelOrder(TreeNode* root) {\n    \n}`,
            javascript: `function levelOrder(root) {\n  \n}`,
            java: `public class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        \n         }\n}`,
            c: `#include <stdlib.h>\nstruct TreeNode { int val; struct TreeNode *left; struct TreeNode *right; };\nint** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {\n    \n}`
        },
        functionSignature: {
            cpp: "vector<vector<int>> levelOrder(TreeNode* root)",
            javascript: "function levelOrder(root) {",
            java: "public List<List<Integer>> levelOrder(TreeNode root)",
            c: "int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes)"
        },
        functionName: "levelOrder",
        customTestCaseInputTemplate: "root=[]"
    },
    {
        title: "Merge K Sorted Lists",
        description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        difficulty: "Hard",
        rating: 2000,
        categories: ["Linked List", "Divide and Conquer", "Heap"],
        timeLimit: 3000,
        memoryLimit: 1024,
        constraints: [
            "0 ≤ k ≤ 10^4",
            "0 ≤ lists[i].length ≤ 500",
            "-10^4 ≤ lists[i][j] ≤ 10^4"
        ],
        publicTestCases: [
            {
                input: "lists = [[1,4,5],[1,3,4],[2,6]]",
                output: "[1,1,2,3,4,4,5,6]",
                explanation: "The linked-lists are: [1->4->5, 1->3->4, 2->6]"
            }
        ],
        hiddenTestCases: [
            {
                input: "lists = []",
                output: "[]"
            },
            {
                input: "lists = [[1],[0]]",
                output: "[0,1]"
            },
            {
                input: "lists = [[2,6,8],[3,6,7],[1,3,4]]",
                output: "[1,2,3,3,4,6,6,7,8]"
            },
            {
                input: "lists = [[-2,-1,-1,-1],[0,1,2],[3,4,5]]",
                output: "[-2,-1,-1,-1,0,1,2,3,4,5]"
            },
            {
                input: "lists = [[1,4,5],[1,3,4],[2,6]]",
                output: "[1,1,2,3,4,4,5,6]"
            },
            {
                input: "lists = [[1,2,3],[4,5,6],[7,8,9]]",
                output: "[1,2,3,4,5,6,7,8,9]"
            },
            {
                input: "lists = [[10,20,30],[5,15,25],[1,2,3]]",
                output: "[1,2,3,5,10,15,20,25,30]"
            }
        ],
        isPublished: true,
        starterCode: {
            cpp: `#include <vector>\nusing namespace std;\nListNode* mergeKLists(vector<ListNode*>& lists) {\n    \n}`,
            javascript: `function mergeKLists(lists) {\n  \n}`,
            java: `public class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}`,
            c: `struct ListNode { int val; struct ListNode *next; };\nstruct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {\n    \n}`
        },
        functionSignature: {
            cpp: "ListNode* mergeKLists(vector<ListNode*>& lists)",
            javascript: "function mergeKLists(lists) {",
            java: "public ListNode mergeKLists(ListNode[] lists)",
            c: "struct ListNode* mergeKLists(struct ListNode** lists, int listsSize)"
        },
            functionName: "mergeKLists",
        customTestCaseInputTemplate: "lists=[]"
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create an admin user if it doesn't exist
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        let adminId;

        if (!adminUser) {
            const newAdmin = await User.create({
                fullName: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            });
            adminId = newAdmin._id;
            console.log('Created admin user');
        } else {
            adminId = adminUser._id;
            console.log('Admin user already exists');
        }

        // Delete existing problems
        await Problem.deleteMany({});
        console.log('Deleted existing problems');

        // Add admin ID to all problems
        const problemsWithAuthor = testProblems.map(problem => ({
            ...problem,
            author: adminId
        }));

        // Insert new problems
        await Problem.insertMany(problemsWithAuthor);
        console.log('Added test problems');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 