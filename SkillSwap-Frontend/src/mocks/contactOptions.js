import { Mail, MessageCircle, Phone } from "lucide-react";

// Contact Options Data
const contactOptions = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "Available 9 AM - 6 PM EST",
    action: "Start Chat",
    primary: true
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message about your issue",
    availability: "Response within 24 hours",
    action: "Send Email"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with a support representative",
    availability: "Mon-Fri, 9 AM - 5 PM EST",
    action: "Call Now"
  }
];

export default contactOptions;