"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleColor?: string;
  particleCount?: number;
  speed?: number;
  animate?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const SparklesCore = ({
  id = "tsparticles",
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  speed = 1,
  particleCount = 40,
  particleColor = "#FFF",
  animate = true,
}: SparklesCoreProps) => {
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize canvas context and set dimensions
  useEffect(() => {
    if (particlesRef.current) {
      const canvas = particlesRef.current;
      const context = canvas.getContext("2d");
      setCtx(context);

      const setCanvasSize = () => {
        const parentElement = canvas.parentElement;
        if (parentElement) {
          const { width, height } = parentElement.getBoundingClientRect();
          setDimensions({ width, height });
          canvas.width = width;
          canvas.height = height;
        }
      };

      setCanvasSize();
      window.addEventListener("resize", setCanvasSize);

      return () => {
        window.removeEventListener("resize", setCanvasSize);
      };
    }
  }, []);

  // Initialize particles once we have canvas dimensions
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.3,
      }));
      
      setParticles(newParticles);
    }
  }, [dimensions, minSize, maxSize, speed, particleCount]);

  // Draw and animate the particles
  useEffect(() => {
    if (!ctx || !animate || particles.length === 0) return;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${Math.round(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce if hit bounds
        if (particle.x < 0 || particle.x > dimensions.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > dimensions.height) {
          particle.speedY *= -1;
        }

        // Random variation in opacity
        particle.opacity += (Math.random() - 0.5) * 0.01;
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ctx, dimensions, particles, particleColor, animate]);

  return (
    <canvas
      ref={particlesRef}
      id={id}
      className={cn("absolute inset-0", className)}
      style={{ background }}
    />
  );
};

export default SparklesCore; 