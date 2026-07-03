export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#0a0a0a] py-6">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
        <p>© {new Date().getFullYear()} VOD System. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Help Center</a>
        </div>
      </div>
    </footer>
  );
}
