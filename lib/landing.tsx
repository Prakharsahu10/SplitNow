import {
  Bell,
  CreditCard,
  PieChart,
  Receipt,
  Users,
  RefreshCw,
} from "lucide-react";

export const FEATURES = [
  {
    title: "Group Expenses",
    Icon: Users,
    bg: "bg-green-100",
    color: "text-green-600",
    description:
      "Create organized groups for roommates, trips, events, or business teams. Keep all shared expenses centralized with clear member management and expense categorization for better financial transparency.",
  },
  {
    title: "Smart Settlements",
    Icon: CreditCard,
    bg: "bg-teal-100",
    color: "text-teal-600",
    description:
      "Our intelligent algorithm calculates the most efficient payment routes, minimizing the total number of transactions needed. Save time and reduce complexity when settling group debts.",
  },
  {
    title: "Expense Analytics",
    Icon: PieChart,
    bg: "bg-green-100",
    color: "text-green-600",
    description:
      "Gain valuable insights into spending patterns with detailed analytics and visual reports. Track expense categories, identify trends, and make informed decisions about your shared financial activities.",
  },
  {
    title: "Payment Reminders",
    Icon: Bell,
    bg: "bg-amber-100",
    color: "text-amber-600",
    description:
      "Automated smart reminders ensure no debt goes forgotten. Receive timely notifications for pending payments and get comprehensive insights into spending patterns to maintain healthy financial relationships.",
  },
  {
    title: "Multiple Split Types",
    Icon: Receipt,
    bg: "bg-green-100",
    color: "text-green-600",
    description:
      "Flexible splitting options to accommodate any scenario - divide equally among all members, allocate by custom percentages, or assign exact amounts based on individual consumption or agreement.",
  },
  {
    title: "Real‑time Updates",
    Icon: RefreshCw,
    bg: "bg-teal-100",
    color: "text-teal-600",
    description:
      "Stay synchronized with instant notifications when group members add new expenses, make payments, or update existing entries. Ensure everyone has the latest financial information at all times.",
  },
];

export const STEPS = [
  {
    label: "1",
    title: "Create or Join a Group",
    description:
      "Start by creating a new group for your specific need - whether it's roommate expenses, vacation costs, business team meals, or event planning. Invite members via email or share a simple group code for instant access.",
  },
  {
    label: "2",
    title: "Add Expenses",
    description:
      "Record every shared expense with detailed information including who paid, what was purchased, and how the cost should be divided. Choose from equal splits, percentage-based allocation, or custom amounts for maximum flexibility.",
  },
  {
    label: "3",
    title: "Settle Up",
    description:
      "Review comprehensive balance summaries showing exactly who owes what to whom. Use our smart settlement algorithm to minimize transactions, then log payments as they occur to keep everyone's balance current.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "SplitNow has completely transformed how our team manages shared expenses. The intuitive interface, combined with smart settlement algorithms, has eliminated the confusion and time-consuming calculations we used to face. The real-time updates ensure everyone stays informed, making our financial processes significantly more efficient and transparent.",
    name: "Sarah Johnson",
    image: "/testimonials/sarah.jpg",
    role: "Project Manager at TechCorp",
  },
  {
    quote:
      "As someone who frequently organizes group trips and events, SplitNow has become an indispensable tool. The expense tracking capabilities and detailed analytics provide complete transparency, while the multiple split options accommodate every scenario we encounter. Our group travel finances have never been this organized and stress-free.",
    name: "Michael Chen",
    image: "/testimonials/michael.jpg",
    role: "Travel Coordinator",
  },
  {
    quote:
      "The analytics and reporting features in SplitNow provide invaluable insights into our household spending patterns. Beyond just splitting bills, it's helped us identify areas for cost optimization and maintain better financial discipline. The automated reminders ensure nothing falls through the cracks, making it essential for our financial management.",
    name: "Emily Rodriguez",
    image: "/testimonials/emily.jpg",
    role: "Financial Analyst",
  },
];
