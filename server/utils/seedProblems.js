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
        timeLimit: 1000,
        memoryLimit: 256,
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
            }
        ],
        isPublished: true
    },
    {
        title: "Add Two Numbers",
        description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        difficulty: "Medium",
        rating: 1600,
        categories: ["Linked List", "Math"],
        timeLimit: 2000,
        memoryLimit: 512,
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
            }
        ],
        isPublished: true
    },
    {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Hard",
        rating: 1900,
        categories: ["String", "Sliding Window", "Hash Table"],
        timeLimit: 3000,
        memoryLimit: 1024,
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
            }
        ],
        isPublished: true
    },
    {
        title: "Binary Tree Level Order Traversal",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        difficulty: "Medium",
        rating: 1500,
        categories: ["Tree", "Breadth-First Search"],
        timeLimit: 2000,
        memoryLimit: 512,
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
            }
        ],
        isPublished: true
    },
    {
        title: "Merge K Sorted Lists",
        description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        difficulty: "Hard",
        rating: 2000,
        categories: ["Linked List", "Divide and Conquer", "Heap"],
        timeLimit: 3000,
        memoryLimit: 1024,
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
            }
        ],
            isPublished: true
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