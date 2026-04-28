"use client";

import { useState } from "react";

const FONTS = [
  "Arial", "Helvetica", "Times New Roman", "Times", "Courier New", "Courier", 
  "Verdana", "Georgia", "Palatino", "Garamond", "Bookman", "Comic Sans MS", 
  "Trebuchet MS", "Arial Black", "Impact", "Tahoma", "Geneva", "Century Gothic", 
  "Lucida Grande", "Optima", "Avant Garde", "Calibri", "Candara", "Cambria", 
  "Consolas", "Perpetua", "Monaco", "Didot", "Brush Script MT", "Lucida Console", 
  "Copperplate", "Papyrus", "Baskerville", "Franklin Gothic Medium", "Segoe UI", 
  "Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans Pro", "Raleway", 
  "PT Sans", "Ubuntu", "Droid Sans", "Noto Sans", "Arial Narrow", "cursive", 
  "fantasy", "monospace", "serif"
];

export default function Home() {
  const [fontIndex, setFontIndex] = useState(0);
  const [color, setColor] = useState("#333333");

  const cycleFont = () => {
    setFontIndex((prev) => (prev + 1) % FONTS.length);
  };

  const changeColor = () => {
    // Generate slightly darker colors so they remain readable on a light background
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColor(randomColor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="max-w-2xl text-center space-y-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600 drop-shadow-sm">
          Typography & Color Playground
        </h1>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 relative overflow-hidden group hover:shadow-indigo-500/10 transition-shadow duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <p 
            className="text-2xl md:text-3xl leading-relaxed transition-all duration-300 relative z-10 drop-shadow-sm"
            style={{ 
              fontFamily: FONTS[fontIndex], 
              color: color 
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600 relative z-10 bg-slate-100/60 py-3 px-6 rounded-full inline-flex mx-auto border border-slate-200/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Font:</span> 
              <span className="bg-white px-3 py-1 rounded-md font-mono border border-slate-200 shadow-sm">{FONTS[fontIndex]}</span>
            </div>
            <div className="hidden sm:block text-slate-400">•</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Color:</span> 
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                <div className="w-3 h-3 rounded-full border border-slate-300 shadow-inner" style={{ backgroundColor: color }} />
                <span className="font-mono">{color}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          <button 
            onClick={cycleFont}
            className="group relative px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 flex-1 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Cycle Font</span>
          </button>
          
          <button 
            onClick={changeColor}
            className="group relative px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:translate-y-0 flex-1 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Random Color</span>
          </button>
        </div>
      </div>
    </div>
  );
}
