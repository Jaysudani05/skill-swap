import React, { useState, useCallback } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  Send,
  ArrowLeft,
  ExternalLink,
  Star
} from 'lucide-react';

import faqData from '../mocks/faqData';
import contactOptions from '../mocks/contactOptions';
import helpResources from '../mocks/helpResources';

// FAQ Section Component
import FAQSection from '../components/NeedHelp/FAQSection';

// Search Results Component
import SearchResults from '../components/NeedHelp/SearchResults';

// Contact Form Component 
import ContactForm from '../components/NeedHelp/ContactForm';
// const ContactForm = ({ onClose }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: '',
//     priority: 'medium'
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     setIsSubmitting(false);
//     setIsSubmitted(true);

//     // Auto close after success
//     setTimeout(() => {
//       onClose();
//     }, 3000);
//   };

//   const handleChange = (e) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   if (isSubmitted) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
//           <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
//           <p className="text-gray-600 mb-4">
//             We've received your message and will get back to you within 24 hours.
//           </p>
//           <button
//             onClick={onClose}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               ×
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 required
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email *
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Priority
//               </label>
//               <select
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//                 <option value="urgent">Urgent</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Subject *
//               </label>
//               <input
//                 type="text"
//                 name="subject"
//                 required
//                 value={formData.subject}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Message *
//               </label>
//               <textarea
//                 name="message"
//                 required
//                 rows="4"
//                 value={formData.message}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Please describe your issue in detail..."
//               />
//             </div>

//             <div className="flex space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Sending...
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-4 w-4 mr-2" />
//                     Send Message
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// Main Need Help Component


const NeedHelp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);

  // Search functionality
  const handleSearch = useCallback((term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    faqData.forEach(category => {
      category.questions.forEach(faq => {
        if (
          faq.question.toLowerCase().includes(term.toLowerCase()) ||
          faq.answer.toLowerCase().includes(term.toLowerCase())
        ) {
          results.push({
            ...faq,
            category: category.category
          });
        }
      });
    });

    setSearchResults(results);
  }, []);

  const toggleItem = useCallback((itemId) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleContactOption = (option) => {
    switch (option.title) {
      case 'Live Chat':
        // Implement live chat
        console.log('Starting live chat...');
        break;
      case 'Email Support':
        setShowContactForm(true);
        break;
      case 'Phone Support':
        // Show phone number or initiate call
        window.open('tel:+91 7016612100');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
                <p className="text-gray-600 mt-1">Find answers and get support</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                24/7 Support Available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contactOptions.map((option, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border cursor-pointer transition-all hover:shadow-md ${option.primary
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              onClick={() => handleContactOption(option)}
            >
              <div className="flex items-center mb-3">
                <option.icon className={`h-6 w-6 mr-3 ${option.primary ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{option.description}</p>
              <p className="text-xs text-gray-500 mb-3">{option.availability}</p>
              <button className={`text-sm font-medium ${option.primary ? 'text-blue-600' : 'text-gray-700'
                }`}>
                {option.action} →
              </button>
            </div>
          ))}
        </div>

        {/* Search Results */}
        <SearchResults searchTerm={searchTerm} results={searchResults} />

        {/* Help Resources */}
        {!searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Help Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpResources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer group"
                  onClick={() => console.log(`Navigate to ${resource.link}`)}
                >
                  <div className="flex items-start">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
                      <resource.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {!searchTerm && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            </div>
            {/* <div className="min-h-screen bg-gray-50 py-12 px-4">
              <FAQContainer faqs={faqData} />
            </div> */}
            {faqData.map((category, index) => (
              <FAQSection
                key={index}
                category={category.category}
                questions={category.questions}
                openItems={openItems}
                toggleItem={toggleItem}
              />
            ))}
          </div>
        )}

        {/* Additional Help */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still need help?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => setShowContactForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm onClose={() => setShowContactForm(false)} />
      )}
    </div>
  );
};

export default NeedHelp;