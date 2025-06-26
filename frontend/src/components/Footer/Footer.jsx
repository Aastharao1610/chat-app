// components/Footer.jsx
const Footer = () => {
  return (
    <footer className="w-full bg-black text-white text-center py-3 mt-auto">
      &copy; {new Date().getFullYear()} Weave Chat. All rights reserved.
    </footer>
  );
};

export default Footer;
