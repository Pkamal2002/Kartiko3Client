import { Link } from 'react-router-dom';
import { Globe, Share2, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-black dark:text-white tracking-tighter">
              Kartiko<span className="text-primary-600">.</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Premium lifestyle ecosystem providing elite electronics, fashion, and toys for the modern individual.
            </p>
            <div className="flex space-x-4">
              {[Globe, Share2].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-xl bg-gray-50 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Shopping</h3>
            <ul className="space-y-4">
              {['Shop All', 'New Arrivals', 'Trending', 'Best Sellers'].map((link) => (
                <li key={link}>
                  <Link to="/shop" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-4">
              {['Contact Us', 'Shipping Policy', 'Returns & Refunds', 'FAQ', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start space-x-3 group">
                <MapPin className="text-primary-600 shrink-0 mt-1" size={20} />
                <span className="text-gray-500 dark:text-gray-400">123 Luxury Avenue, Tech City, 10001</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone className="text-primary-600 shrink-0" size={20} />
                <span className="text-gray-500 dark:text-gray-400">+1 (555) 000-1234</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail className="text-primary-600 shrink-0" size={20} />
                <span className="text-gray-500 dark:text-gray-400">support@kartiko.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-sm text-gray-400">
          <div>
             <p className="mb-2 text-center md:text-left">© {new Date().getFullYear()} Kartiko E-Commerce. All rights reserved.</p>
             <div className="flex space-x-6 justify-center md:justify-start">
               <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookies</a>
             </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-3">
             <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Secure Payments</p>
             <div className="flex items-center space-x-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-5" />
                <span className="font-bold text-gray-400">UPI</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
