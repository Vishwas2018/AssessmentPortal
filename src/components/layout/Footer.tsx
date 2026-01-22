import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  ExternalLink,
} from "lucide-react";
import { ROUTES } from "@/data/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "NAPLAN Practice", href: ROUTES.EXAMS },
      { label: "ICAS Practice", href: ROUTES.EXAMS },
      { label: "Pricing", href: ROUTES.PRICING },
      { label: "Free Trial", href: ROUTES.REGISTER },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" },
    ],
    support: [
      { label: "Help Center", href: "#help" },
      { label: "FAQ", href: "#faq" },
      { label: "Parent Guide", href: "#parent-guide" },
      { label: "Contact Us", href: "#contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "Refund Policy", href: "#refund" },
    ],
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://facebook.com",
      label: "Facebook",
      color: "hover:text-blue-500",
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: "Twitter",
      color: "hover:text-sky-500",
    },
    {
      icon: Instagram,
      href: "https://instagram.com",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: Youtube,
      href: "https://youtube.com",
      label: "YouTube",
      color: "hover:text-red-500",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-purple-500 p-3 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                EduAssess
              </span>
            </Link>
            <p className="text-gray-400 font-medium mb-6 leading-relaxed">
              Making exam preparation fun and effective for Australian students.
              Practice NAPLAN and ICAS tests with confidence! 🚀
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@eduassess.com.au"
                className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 text-primary-400" />
                <span className="font-medium">hello@eduassess.com.au</span>
              </a>
              <a
                href="tel:+61399999999"
                className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5 text-primary-400" />
                <span className="font-medium">+61 3 9999 9999</span>
              </a>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 text-primary-400" />
                <span className="font-medium">Melbourne, Australia</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 ${social.color} transition-colors`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-black text-lg mb-6 text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white font-medium transition-colors inline-flex items-center space-x-1 group"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-black text-lg mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-black text-lg mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-black text-lg mb-6 text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-12 border-t border-gray-800">
          <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-3xl p-8 border border-primary-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Stay Updated! 📬
                </h3>
                <p className="text-gray-400 font-medium">
                  Get tips, new features, and study resources delivered to your
                  inbox.
                </p>
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-primary-500 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 font-medium text-center md:text-left">
              © {currentYear} EduAssess Platform. All rights reserved.
            </p>
            <p className="text-gray-500 font-medium flex items-center space-x-2">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for Australian students</span>
              <span className="text-2xl">🇦🇺</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
