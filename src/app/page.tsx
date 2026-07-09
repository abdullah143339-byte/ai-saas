"use client";

import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  ImageIcon,
  FileText,
  Zap,
  Shield,
  Infinity,
  ArrowRight,
  Check,
  Star,
  ArrowUpRight,
  Code2,
  ExternalLink,
  Globe,
  Phone,
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import HelpAssistant from "@/components/HelpAssistant";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description:
      "Engage in intelligent conversations with our advanced AI. Get answers, brainstorm ideas, and solve complex problems.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    description:
      "Transform your imagination into stunning visuals. Generate high-quality images from simple text prompts.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Text Summarization",
    description:
      "Condense lengthy documents into concise summaries. Extract key insights in seconds, not hours.",
    color: "from-orange-500 to-red-500",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "50 AI chat messages",
      "10 image generations",
      "5 summarizations",
      "Basic support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Best for professionals",
    features: [
      "Unlimited AI chat",
      "100 image generations",
      "50 summarizations",
      "Priority support",
      "Image editing & remix",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "For teams and businesses",
    features: [
      "Everything in Pro",
      "Unlimited generations",
      "Team collaboration",
      "Dedicated support",
      "Custom integrations",
    ],
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary-light text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Advanced AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-light leading-tight mb-6">
            Supercharge Your Workflow
            <br />
            <span className="gradient-text">with AI-Powered Tools</span>
          </h1>

          <p className="text-lg sm:text-xl text-light-3 max-w-2xl mx-auto mb-10">
            Harness the power of artificial intelligence for chat, image
            generation, and text summarization. All in one seamless platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="btn-primary text-lg flex items-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="btn-secondary text-lg"
            >
              Explore Features
            </a>
              </div>

              <div className="flex items-center justify-center gap-8 mt-12 text-sm text-light-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Fast Response</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Infinity className="w-4 h-4 text-accent" />
              <span>Unlimited Possibilities</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-light mb-4">
              Powerful Features for{" "}
              <span className="gradient-text">Modern Teams</span>
            </h2>
            <p className="text-light-3 max-w-2xl mx-auto">
              Everything you need to leverage AI in your daily workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card-hover group"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: index * 0.2 }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-semibold text-light mb-3">
                  {feature.title}
                </h3>
                <p className="text-light-3 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto glass rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", value: "10K+" },
              { label: "AI Messages", value: "1M+" },
              { label: "Images Generated", value: "50K+" },
              { label: "Documents Summarized", value: "25K+" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-light-3 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-light mb-4">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-light-3 max-w-2xl mx-auto">
              Choose the plan that fits your needs. No hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative card ${
                  plan.highlighted
                    ? "border-primary/50 scale-105 bg-primary/5"
                    : ""
                }`}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: index * 0.2 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-bg rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-light-3 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-light">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-light-3">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-light-2"
                    >
                      <Check className="w-5 h-5 text-primary-light flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === "Free" ? (
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 btn-outline"
                  >
                    Get Started
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center text-sm text-primary-light font-medium">
                      Send payment to activate:
                    </div>
                    <div className="glass rounded-xl p-3 text-center">
                      <div className="text-light font-bold">Heaven Choice Beauty Sallon</div>
                      <div className="text-light-2 text-sm">JazzCash</div>
                      <div className="text-lg font-bold gradient-text">0342 2898741</div>
                    </div>
                    <p className="text-xs text-light-3 text-center">
                      After payment, your account will be activated manually.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Defy Chatbot Showcase */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold gradient-text">Defy AI Chatbot</h2>
          </motion.div>

          <motion.div
            className="glass rounded-3xl p-8 sm:p-10"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 mb-4">
                  <MessageSquare className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold text-light mb-3">
                  AI-Powered Smart Assistant
                </h3>
                <ul className="space-y-3 text-light-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Free & unlimited AI chat — no signup required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Powered by Gemini AI for smart, accurate responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Clean, modern UI with dark mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Fast & responsive — works on any device</span>
                  </li>
                </ul>
                <a
                  href="https://defy-ai-chat.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 mt-6 group"
                >
                  Try Defy Chatbot
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="glass rounded-2xl p-6 text-center space-y-4">
                <Zap className="w-10 h-10 text-accent mx-auto" />
                <p className="text-light-2 text-sm leading-relaxed">
                  Defy AI Chatbot is a smart, fast, and completely free AI assistant. 
                  Built with Gemini AI — it understands complex questions, 
                  gives accurate answers, and helps you with anything you need. 
                  No signup, no limits, just pure AI power.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-light mb-4">
              Built with Passion by{" "}
              <span className="gradient-text">Abdullah Fauji</span>
            </h2>
            <p className="text-light-3 max-w-2xl mx-auto">
              A passionate developer crafting modern AI-powered solutions.
            </p>
          </motion.div>

          <motion.div
            className="glass rounded-3xl p-8 sm:p-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1 mb-6">
                  <div className="w-full h-full rounded-full bg-dark-2 flex items-center justify-center">
                    <Code2 className="w-14 h-14 text-primary-light" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-light mb-2">
                  Abdullah Fauji
                </h3>
                <p className="text-primary-light font-medium mb-4">
                  Full-Stack Developer & AI Enthusiast
                </p>
                <p className="text-light-3 text-sm mb-4">Serf University</p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="p-2 glass rounded-lg text-light-3 hover:text-primary-light transition-colors"
                  >
                    <Code2 className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="p-2 glass rounded-lg text-light-3 hover:text-primary-light transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="p-2 glass rounded-lg text-light-3 hover:text-primary-light transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-light-2 leading-relaxed">
                  Hi! I&apos;m Abdullah Fauji, a full-stack developer with a deep
                  passion for artificial intelligence and modern web technologies.
                  I specialize in building scalable SaaS platforms that leverage
                  cutting-edge AI to solve real-world problems.
                </p>
                <p className="text-light-2 leading-relaxed">
                  AIForge is my vision to make powerful AI tools accessible to
                  everyone. From intelligent chat assistants to AI-powered image
                  generation and text summarization, every feature is crafted
                  with care to deliver a seamless user experience.
                </p>
                <p className="text-light-2 leading-relaxed">
                  I believe in the transformative power of AI and am committed
                  to building products that make a difference. When I&apos;m not
                  coding, you&apos;ll find me exploring new technologies,
                  contributing to open-source, and pushing the boundaries of
                  what&apos;s possible with AI.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <HelpAssistant />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-light mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-light-3 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already leveraging AI to supercharge
            their productivity.
          </p>
          <Link
            href="/auth/signup"
            className="btn-primary text-lg inline-flex items-center gap-2 group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-light-3 text-sm mb-4">If you have any problem, contact me</p>
          <a
            href="tel:03187637648"
            className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-light hover:text-primary-light transition-all group"
          >
            <Phone className="w-4 h-4 text-primary-light group-hover:scale-110 transition-transform" />
            <span className="font-medium">0318-7637648</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-light" />
            <span className="font-bold gradient-text">AIForge</span>
          </div>
          <p className="text-light-3 text-sm">
            &copy; {new Date().getFullYear()} AIForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
