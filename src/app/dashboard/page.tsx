"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  ImageIcon,
  FileText,
  Activity,
  Clock,
  Code2,
} from "lucide-react";
import Link from "next/link";

interface UsageStats {
  chat: number;
  images: number;
  summaries: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageStats>({
    chat: 0,
    images: 0,
    summaries: 0,
  });

  useEffect(() => {
    const fetchUsage = async () => {
      const res = await fetch("/api/user/usage");
      const data = await res.json();
      if (data) {
        setUsage({
          chat: data.chatUsage ?? 0,
          images: data.imageUsage ?? 0,
          summaries: data.summaryUsage ?? 0,
        });
      }
    };
    fetchUsage();
  }, []);

  const stats = [
    {
      icon: MessageSquare,
      label: "Chat Messages",
      value: usage.chat,
      limit: "Unlimited",
      color: "from-blue-500 to-cyan-500",
      href: "/dashboard/chat",
    },
    {
      icon: ImageIcon,
      label: "Images Generated",
      value: usage.images,
      limit: "100/month (Pro)",
      color: "from-purple-500 to-pink-500",
      href: "/dashboard/image-generator",
    },
    {
      icon: FileText,
      label: "Summarizations",
      value: usage.summaries,
      limit: "50/month (Pro)",
      color: "from-orange-500 to-red-500",
      href: "/dashboard/summarizer",
    },
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-light">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}! 👋
          </h1>
          <p className="text-light-3 mt-1">
            Here&apos;s an overview of your AI tools and usage.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-light-3 glass inline-flex px-3 py-1.5 rounded-full">
            <Code2 className="w-3.5 h-3.5 text-primary-light" />
            <span>Built by <span className="text-primary-light font-medium">Muhammad Abdullah</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-light-2 text-sm mb-6 glass inline-flex px-4 py-2 rounded-lg">
          <Activity className="w-4 h-4 text-primary-light" />
          <span>Usage Overview</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="card-hover group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-2.5 mb-4`}
              >
                <stat.icon className="w-full h-full text-white" />
              </div>
              <div className="text-2xl font-bold text-light mb-1">
                {stat.value}
              </div>
              <div className="text-light-3 text-sm">{stat.label}</div>
              <div className="mt-2 text-xs text-light-3">
                Limit: {stat.limit}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-light-2 text-sm mb-6 glass inline-flex px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-primary-light" />
          <span>Quick Access</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/chat"
            className="card-hover flex items-center gap-4"
          >
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="font-semibold text-light">AI Chat</h3>
              <p className="text-sm text-light-3">Start a conversation</p>
            </div>
          </Link>
          <Link
            href="/dashboard/image-generator"
            className="card-hover flex items-center gap-4"
          >
            <ImageIcon className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="font-semibold text-light">Generate Image</h3>
              <p className="text-sm text-light-3">Create with AI</p>
            </div>
          </Link>
          <Link
            href="/dashboard/summarizer"
            className="card-hover flex items-center gap-4"
          >
            <FileText className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="font-semibold text-light">Summarize</h3>
              <p className="text-sm text-light-3">Summarize text</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
