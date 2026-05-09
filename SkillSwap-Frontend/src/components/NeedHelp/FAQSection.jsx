import React from 'react';
import FAQItem from './FAQItem';

const FAQSection = ({ category, questions, openItems, toggleItem }) => {
    return (
        <div className="mb-10">
            {/* Category Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
            
            {/* FAQ Items Container */}
            <div className="space-y-0">
                {questions.map((faq, index) => {
                    const itemKey = `${category}-${index}`;
                    return (
                        <div 
                            key={itemKey}
                            className={`${index === 0 ? '' : ''} ${index === questions.length - 1 ? '' : ''}`}
                        >
                            <FAQItem
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openItems.includes(itemKey)}
                                onToggle={() => toggleItem(itemKey)}
                            />
                        </div>
                    );
                })}
            </div>
             
        </div>
    );
};

export default FAQSection;
