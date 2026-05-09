import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import React from 'react';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-blue-50 focus:border-blue-300 group"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${question}`}
            >
                <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-focus:bg-blue-200 transition-colors duration-200">
                            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                    </div>
                    <span className="font-semibold text-gray-900 text-left leading-6 pr-4 group-focus:text-blue-900">
                        {question}
                    </span>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-0' : ''}`}>
                        {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 group-focus:text-blue-600" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 group-focus:text-blue-600" />
                        )}
                    </div>
                </div>
            </button>
            
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div 
                    id={`faq-answer-${question}`}
                    className="px-6 pb-6 text-gray-600 leading-7 border-t border-gray-100"
                >
                    <div className="pt-4">
                        {typeof answer === 'string' ? (
                            <p>{answer}</p>
                        ) : (
                            answer
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQItem;
