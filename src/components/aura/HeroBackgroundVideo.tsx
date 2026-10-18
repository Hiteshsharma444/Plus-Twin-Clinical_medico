import React, { useEffect, useRef } from 'react';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4';

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevMouseXRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkIsDesktop = () => window.innerWidth >= 1024;
    let isDesktop = checkIsDesktop();

    const handleResize = () => {
      isDesktop = checkIsDesktop();
      if (!isDesktop && video) {
        video.autoplay = true;
        video.play().catch(() => {});
      }
    };

    window.addEventListener('resize', handleResize);

    const handleSeeked = () => {
      isSeekingRef.current = false;
    };
    video.addEventListener('seeked', handleSeeked);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDesktop || !video || !video.duration || Number.isNaN(video.duration)) {
        return;
      }

      if (prevMouseXRef.current === null) {
        prevMouseXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevMouseXRef.current;
      prevMouseXRef.current = e.clientX;

      if (!video.paused) {
        video.pause();
      }

      const timeDelta = (delta / window.innerWidth) * 0.8 * video.duration;
      const targetTime = Math.max(0, Math.min(video.duration, video.currentTime + timeDelta));

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTime;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initial play attempt
    video.play().catch(() => {});

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  return (
    <>
      {/* Left-oriented interactive background video layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full lg:w-[65%] origin-left lg:-rotate-5 transition-transform duration-700 ease-out">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-left lg:object-left-bottom pointer-events-none"
            src={VIDEO_SRC}
          />
        </div>
        {/* Dark contrast scrim overlay for guaranteed legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c]/90 via-[#0c0c0c]/60 to-[#0c0c0c]/20 pointer-events-none" />
      </div>

      {/* Two hidden-on-mobile fixed vertical guide lines at 36rem container edges */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />
    </>
  );
}
