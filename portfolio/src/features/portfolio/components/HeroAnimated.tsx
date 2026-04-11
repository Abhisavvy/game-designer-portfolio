"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { OptimizedImage } from "./OptimizedImage";
import { 
  Gamepad2, 
  Zap, 
  Target, 
  TrendingUp,
  Settings,
  Activity,
  BarChart3,
  Users,
  Database,
  Smartphone,
  Package,
  Calendar,
  DollarSign,
  RefreshCcw,
  Puzzle,
  Trophy,
  Coins,
  Clock,
  LineChart
} from "lucide-react";

interface HeroAnimatedProps {
  headline: string;
  subline: string;
  statPills: string[];
}

export function HeroAnimated({ headline, subline, statPills }: HeroAnimatedProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 120,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Organic floating elements inspired by mobile gaming */}
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-orange-600/15 to-orange-500/20 rounded-[40%_60%_70%_30%] blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
            borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "40% 60% 70% 30%"],
          }}
          transition={{ 
            type: "spring", 
            damping: 50,
            borderRadius: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            top: "20%",
            left: "10%",
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-orange-500/10 to-orange-400/15 rounded-[70% 30% 50% 50%] blur-3xl"
          animate={{
            x: mousePosition.x * -0.01,
            y: mousePosition.y * -0.01,
            borderRadius: ["70% 30% 50% 50%", "30% 70% 50% 50%", "70% 30% 50% 50%"],
          }}
          transition={{ 
            type: "spring", 
            damping: 30,
            borderRadius: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            top: "60%",
            right: "10%",
          }}
        />
        <motion.div
          className="absolute w-48 h-48 bg-gradient-to-r from-orange-400/20 to-orange-300/25 rounded-[60% 40% 40% 60%] blur-2xl"
          animate={{
            x: mousePosition.x * 0.015,
            y: mousePosition.y * 0.015,
            borderRadius: ["60% 40% 40% 60%", "40% 60% 60% 40%", "60% 40% 40% 60%"],
          }}
          transition={{ 
            type: "spring", 
            damping: 40,
            borderRadius: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            bottom: "20%",
            left: "20%",
          }}
        />

        {/* Portfolio-relatable animated icons */}
        <motion.div
          className="absolute top-16 right-24 text-orange-500/20"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Settings className="w-8 h-8" />
        </motion.div>

        <motion.div
          className="absolute top-32 left-24 text-orange-400/25"
          animate={{
            y: [-8, 8, -8],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Calendar className="w-6 h-6" />
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-32 text-orange-300/20"
          animate={{
            x: [-6, 6, -6],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <DollarSign className="w-9 h-9" />
        </motion.div>

        <motion.div
          className="absolute bottom-24 left-32 text-orange-400/25"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <RefreshCcw className="w-7 h-7" />
        </motion.div>

        <motion.div
          className="absolute top-40 right-16 text-orange-500/15"
          animate={{
            y: [-5, 10, -5],
            x: [-3, 3, -3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          <Trophy className="w-6 h-6" />
        </motion.div>

        <motion.div
          className="absolute bottom-16 right-16 text-orange-300/20"
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Puzzle className="w-8 h-8" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-16 text-orange-400/15"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <Coins className="w-5 h-5" />
        </motion.div>

        <motion.div
          className="absolute top-24 left-1/3 text-orange-500/20"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <LineChart className="w-7 h-7" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/2 right-1/4 text-orange-400/20"
          animate={{
            x: [-4, 8, -4],
            y: [-2, 4, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5,
          }}
        >
          <Clock className="w-6 h-6" />
        </motion.div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, orange 1px, transparent 0)
              `,
              backgroundSize: "50px 50px"
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto pb-20"
        variants={containerVariants}
        initial="visible"
        animate="visible"
      >
        {/* Profile Image Placeholder */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-orange-500/40 rounded-full blur-xl opacity-60" />
            <OptimizedImage
              src="/assets/general/profile/abhishek-headshot.webp"
              alt="Abhishek Dutta - Game Designer"
              width={128}
              height={128}
              priority={true}
              className="relative w-full h-full rounded-full border-2 border-orange-500/30 object-cover"
              placeholder={
                <div className="w-full h-full bg-zinc-800/50 backdrop-blur-sm border-2 border-orange-500/30 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-orange-300/60" />
                  <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Photo
                  </div>
                </div>
              }
            />
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {headline}
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          {subline}
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          variants={itemVariants}
        >
          {statPills.map((pill, index) => {
            const getIcon = () => {
              if (pill.includes('Data driven')) return Database;
              if (pill.includes('Mobile First')) return Smartphone;
              if (pill.includes('Features shipped')) return Package;
              return Target;
            };
            const Icon = getIcon();
            
            return (
              <motion.div
                key={pill}
                className="group"
                variants={pillVariants}
                whileHover={{ scale: 1.02 }}
                custom={index}
              >
                <div className="flex items-center space-x-2 px-4 py-2 bg-zinc-900/40 border border-orange-500/20 rounded-lg text-white font-normal text-sm hover:border-orange-500/40 transition-colors">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">{pill}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="space-y-4 mt-8"
        >
          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full text-black font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              document.getElementById('featured-work')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }}
          >
            <span className="relative z-10">View My Work</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex flex-col items-center justify-center text-gray-400 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="flex flex-col items-center justify-center space-y-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-sm text-center">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex items-center justify-center">
            <motion.div
              className="w-1 h-3 bg-gray-400 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}