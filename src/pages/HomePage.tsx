import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/data/constants";
import {
  BookOpen,
  BarChart3,
  ArrowRight,
  Star,
  Sparkles,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
  Quote,
  CheckCircle2,
  Shield,
  Clock,
  Users,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/layout/Footer";

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Year 5 Student",
    location: "Sydney, NSW",
    avatar: "👧",
    rating: 5,
    text: "EduAssess made NAPLAN practice actually fun! I used to be scared of tests, but now I feel super confident. My scores improved so much!",
    highlight: "Scores improved by 35%",
  },
  {
    id: 2,
    name: "James T.",
    role: "Parent",
    location: "Melbourne, VIC",
    avatar: "👨",
    rating: 5,
    text: "As a parent, I love being able to track my son's progress. The platform is safe, engaging, and actually makes him want to practice!",
    highlight: "Easy progress tracking",
  },
  {
    id: 3,
    name: "Emily K.",
    role: "Year 7 Student",
    location: "Brisbane, QLD",
    avatar: "👩",
    rating: 5,
    text: "The ICAS practice tests are exactly like the real thing! I got a Distinction this year thanks to EduAssess. Highly recommend!",
    highlight: "Achieved Distinction",
  },
  {
    id: 4,
    name: "Michael R.",
    role: "Teacher",
    location: "Perth, WA",
    avatar: "👨‍🏫",
    rating: 5,
    text: "I recommend EduAssess to all my students. The questions are well-designed and aligned with the Australian curriculum perfectly.",
    highlight: "Curriculum aligned",
  },
];

// FAQ data
const faqs = [
  {
    question: "What is EduAssess?",
    answer:
      "EduAssess is an online learning platform designed specifically for Australian students in Years 2-9. We provide practice tests for NAPLAN and ICAS exams in a fun, engaging, and kid-friendly environment.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "You can sign up for free and get access to 5 free practice tests across different subjects. No credit card required! If you love it (and we think you will! 😊), you can upgrade to a premium plan for unlimited access.",
  },
  {
    question: "Are the practice tests similar to real NAPLAN/ICAS exams?",
    answer:
      "Yes! Our questions are carefully designed by experienced educators to match the format, difficulty, and style of actual NAPLAN and ICAS exams. Students who practice with us feel much more confident on test day.",
  },
  {
    question: "Can parents track their child's progress?",
    answer:
      "Absolutely! Parents can add their email to receive progress reports, see detailed analytics on strengths and areas for improvement, and celebrate achievements together with their child.",
  },
  {
    question: "Is my child's data safe?",
    answer:
      "Yes, we take privacy very seriously. We comply with Australian Privacy Principles and never share personal information with third parties. All data is encrypted and stored securely.",
  },
  {
    question: "What subjects are covered?",
    answer:
      "We cover all NAPLAN domains (Reading, Writing, Language Conventions, Numeracy) and ICAS subjects (English, Mathematics, Science, Digital Technologies, Spelling Bee). New content is added regularly!",
  },
  {
    question: "Can I use EduAssess on a tablet or phone?",
    answer:
      "Yes! EduAssess works great on tablets, which is perfect for kids. Our responsive design ensures a smooth experience on any device - desktop, tablet, or mobile.",
  },
  {
    question: "What if I need help or have questions?",
    answer:
      "Our friendly support team is here to help! You can reach us via email at hello@eduassess.com.au or through our Help Center. We typically respond within 24 hours.",
  },
];

// FAQ Item Component
function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b-2 border-gray-200 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors pr-4">
          {faq.question}
        </span>
        <div
          className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 font-medium text-lg leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-10 text-yellow-300 opacity-30"
        >
          <Star size={60} fill="currentColor" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-40 right-20 text-pink-300 opacity-30"
        >
          <Sparkles size={50} fill="currentColor" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-40 left-20 text-purple-300 opacity-30"
        >
          <Trophy size={70} fill="currentColor" />
        </motion.div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b-4 border-primary-400 sticky top-0 z-50">
        <div className="container-custom py-4 flex justify-between items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className="bg-gradient-to-br from-primary-500 to-purple-500 p-3 rounded-2xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              EduAssess
            </h1>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-x-4"
          >
            <Link to={ROUTES.LOGIN}>
              <button className="px-6 py-3 rounded-xl font-bold text-primary-600 hover:bg-primary-50 transition-all transform hover:scale-105">
                Login
              </button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <button className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:-translate-y-1">
                Sign Up Free! 🚀
              </button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative container-custom py-20">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center space-x-2">
              <Star className="h-5 w-5" fill="currentColor" />
              <span>Made Just for Aussie Kids!</span>
              <Star className="h-5 w-5" fill="currentColor" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ace Your Exams
            </span>
            <br />
            <span className="text-gray-800">With Confidence! 💪</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-gray-700 mb-10 font-semibold"
          >
            Practice NAPLAN & ICAS tests that make learning{" "}
            <span className="text-purple-600">FUN! 🎉</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-6 justify-center items-center flex-wrap"
          >
            <Link to={ROUTES.REGISTER}>
              <button className="group px-10 py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 hover:-translate-y-2 flex items-center space-x-3">
                <span>Get Started FREE!</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="px-10 py-5 rounded-2xl font-bold text-xl border-4 border-purple-500 text-purple-600 hover:bg-purple-50 transition-all transform hover:scale-105">
                See How It Works 📖
              </button>
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-wrap justify-center gap-8"
          >
            {[
              { icon: Shield, text: "Safe & Secure" },
              { icon: Users, text: "10,000+ Students" },
              { icon: CheckCircle2, text: "Curriculum Aligned" },
            ].map((badge, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-600"
              >
                <badge.icon className="h-5 w-5 text-green-500" />
                <span className="font-semibold">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            {
              icon: BookOpen,
              title: "Fun Practice Tests",
              desc: "NAPLAN & ICAS style questions",
              color: "from-blue-400 to-cyan-400",
              emoji: "📚",
            },
            {
              icon: BarChart3,
              title: "Track Your Progress",
              desc: "See how much you improve!",
              color: "from-purple-400 to-pink-400",
              emoji: "📈",
            },
            {
              icon: Trophy,
              title: "Earn Achievements",
              desc: "Collect badges & rewards",
              color: "from-yellow-400 to-orange-400",
              emoji: "🏆",
            },
            {
              icon: Target,
              title: "Beat Your Best",
              desc: "Challenge yourself daily",
              color: "from-green-400 to-teal-400",
              emoji: "🎯",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-gray-100 hover:border-primary-300 transition-all h-full">
                <div
                  className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2 flex items-center space-x-2">
                  <span>{feature.title}</span>
                  <span className="text-3xl">{feature.emoji}</span>
                </h3>
                <p className="text-gray-600 font-semibold text-lg">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-white">
            <Star size={100} fill="currentColor" />
          </div>
          <div className="absolute bottom-10 right-10 text-white">
            <Trophy size={120} fill="currentColor" />
          </div>
        </div>

        <div className="relative container-custom">
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-center text-white mb-16"
          >
            Join Thousands of Smart Kids! 🌟
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "10,000+", label: "Happy Students", icon: "😊" },
              { number: "50,000+", label: "Tests Completed", icon: "✅" },
              { number: "95%", label: "Feel More Confident", icon: "💪" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border-4 border-white/30 hover:scale-105 transition-transform">
                  <div className="text-6xl mb-4">{stat.icon}</div>
                  <div className="text-5xl font-black text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xl font-bold text-white/90">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="relative py-20 bg-white">
        <div className="container-custom">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-center mb-4"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Super Easy to Get Started!
            </span>
          </motion.h2>
          <p className="text-2xl text-center text-gray-600 font-semibold mb-16">
            Just 3 simple steps! 🚀
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Sign Up Free",
                desc: "Create your account in 30 seconds!",
                icon: "✨",
                color: "from-blue-400 to-cyan-400",
              },
              {
                step: "2",
                title: "Pick Your Test",
                desc: "Choose from NAPLAN or ICAS exams",
                icon: "📝",
                color: "from-purple-400 to-pink-400",
              },
              {
                step: "3",
                title: "Start Learning!",
                desc: "Practice and watch yourself improve",
                icon: "🎯",
                color: "from-green-400 to-teal-400",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-full h-1 bg-gradient-to-r from-gray-300 to-transparent transform translate-x-1/2 -translate-y-1/2 z-0" />
                )}

                <div className="relative z-10 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className={`inline-flex w-20 h-20 rounded-full bg-gradient-to-br ${item.color} text-white text-4xl font-black items-center justify-center shadow-2xl mb-6 border-4 border-white`}
                  >
                    {item.step}
                  </motion.div>
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <h3 className="text-3xl font-black text-gray-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xl text-gray-600 font-semibold">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container-custom">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                What Our Students Say
              </span>
            </h2>
            <p className="text-2xl text-gray-600 font-semibold">
              Real stories from real Aussie families! 🇦🇺
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-4 border-gray-100 relative"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Quote className="h-6 w-6 text-white" />
                </div>

                {/* Stars */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 font-medium text-lg mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Highlight Badge */}
                <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm mb-6">
                  ✨ {testimonial.highlight}
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-black text-gray-800">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500 font-medium">
                      {testimonial.role}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="relative py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-2xl text-gray-600 font-semibold">
              Got questions? We've got answers! 💡
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto bg-gray-50 rounded-3xl p-8 border-4 border-gray-100">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>

          {/* Still have questions? */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-xl text-gray-600 font-semibold mb-4">
              Still have questions?
            </p>
            <a href="mailto:hello@eduassess.com.au">
              <button className="px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Contact Us 📧
              </button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="relative py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-white mb-4">
              Why Parents & Kids Love Us 💜
            </h2>
            <p className="text-xl text-gray-400 font-semibold">
              Built by educators, loved by families
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                desc: "Privacy-first design with no ads or distractions",
                color: "from-green-400 to-emerald-400",
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                desc: "Learn from mistakes with detailed explanations",
                color: "from-yellow-400 to-orange-400",
              },
              {
                icon: Target,
                title: "Curriculum Aligned",
                desc: "Questions match Australian education standards",
                color: "from-blue-400 to-cyan-400",
              },
              {
                icon: Clock,
                title: "Learn Anytime",
                desc: "Practice at your own pace, on any device",
                color: "from-purple-400 to-pink-400",
              },
              {
                icon: Trophy,
                title: "Gamified Learning",
                desc: "Earn badges and achievements as you improve",
                color: "from-red-400 to-rose-400",
              },
              {
                icon: Users,
                title: "Parent Dashboard",
                desc: "Track progress and celebrate wins together",
                color: "from-indigo-400 to-violet-400",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div
                  className={`inline-block p-3 rounded-xl bg-gradient-to-br ${item.color} mb-4`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative py-20 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute text-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star size={20} fill="currentColor" />
          </motion.div>
        ))}

        <div className="relative container-custom text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl font-black text-white mb-6">
              Ready to Become a <br />
              <span className="text-yellow-200">Super Smart Student?</span> 🚀
            </h2>
            <p className="text-2xl text-white/90 font-bold mb-10">
              Join thousands of kids who are acing their exams!
            </p>
            <Link to={ROUTES.REGISTER}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-6 rounded-3xl font-black text-2xl bg-white text-purple-600 shadow-2xl hover:shadow-3xl transition-all inline-flex items-center space-x-4"
              >
                <span>Start Your Journey NOW!</span>
                <ArrowRight className="h-8 w-8" />
              </motion.button>
            </Link>
            <p className="mt-6 text-white/80 font-semibold">
              ✨ No credit card required • Free tests included
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
