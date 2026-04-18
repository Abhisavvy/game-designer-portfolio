"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FieldError {
  field: string;
  message: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ContactFormProps {
  recipientEmail: string;
}

export function ContactForm({ recipientEmail }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Smart validation
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 5) return 'Subject must be at least 5 characters';
        return null;
      
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return null;
      
      default:
        return null;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on input
    setErrors(prev => prev.filter(error => error.field !== field));
    
    // Real-time validation after user stops typing
    setTimeout(() => {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => [...prev.filter(e => e.field !== field), { field, message: error }]);
      }
    }, 500);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];
    
    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors.push({ field, message: error });
      }
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus('error');
      setStatusMessage('Please fix the errors above');
      return;
    }

    try {
      // Create mailto link with form data
      const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Hi,\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;
      
      // Open email client immediately (no fake delay)
      window.location.href = mailtoUrl;
      
      setStatus('success');
      setStatusMessage('Opening your email client... If it doesn\'t open automatically, you can email me directly at ' + recipientEmail);
      
      // Reset form after user has had time to see the message
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setStatus('idle');
        setStatusMessage('');
      }, 8000); // Longer timeout since no fake loading
      
    } catch (error) {
      setStatus('error');
      setStatusMessage('Unable to open email client. Please email me directly at ' + recipientEmail);
    }
  };

  const getFieldError = (field: string) => errors.find(error => error.field === field)?.message;
  const hasFieldError = (field: string) => errors.some(error => error.field === field);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-400 
                         focus:outline-none focus:ring-2 transition-colors
                         ${hasFieldError('name') 
                           ? 'border-red-500 focus:ring-red-500/50' 
                           : 'border-zinc-600 focus:ring-orange-500/50 focus:border-orange-500'}`}
              placeholder="Your name"
              disabled={status === 'loading'}
            />
            <AnimatePresence>
              {hasFieldError('name') && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-400 flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {getFieldError('name')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-400 
                         focus:outline-none focus:ring-2 transition-colors
                         ${hasFieldError('email') 
                           ? 'border-red-500 focus:ring-red-500/50' 
                           : 'border-zinc-600 focus:ring-orange-500/50 focus:border-orange-500'}`}
              placeholder="your.email@example.com"
              disabled={status === 'loading'}
            />
            <AnimatePresence>
              {hasFieldError('email') && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-400 flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {getFieldError('email')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-400 
                       focus:outline-none focus:ring-2 transition-colors
                       ${hasFieldError('subject') 
                         ? 'border-red-500 focus:ring-red-500/50' 
                         : 'border-zinc-600 focus:ring-orange-500/50 focus:border-orange-500'}`}
            placeholder="Game design collaboration, project inquiry, etc."
            disabled={status === 'loading'}
          />
          <AnimatePresence>
            {hasFieldError('subject') && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1 text-sm text-red-400 flex items-center"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {getFieldError('subject')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Message *
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={5}
            className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-400 
                       focus:outline-none focus:ring-2 transition-colors resize-vertical
                       ${hasFieldError('message') 
                         ? 'border-red-500 focus:ring-red-500/50' 
                         : 'border-zinc-600 focus:ring-orange-500/50 focus:border-orange-500'}`}
            placeholder="Tell me about your project, collaboration ideas, or any questions you have..."
            disabled={status === 'loading'}
          />
          <AnimatePresence>
            {hasFieldError('message') && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1 text-sm text-red-400 flex items-center"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {getFieldError('message')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={status === 'success'}
          className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 
                     ${status === 'success' 
                       ? 'bg-green-600 text-white' 
                       : status === 'error'
                       ? 'bg-red-600 text-white'
                       : 'bg-gradient-to-r from-orange-600 to-orange-500 text-black hover:shadow-2xl hover:shadow-orange-500/25'
                     } disabled:cursor-not-allowed`}
          whileHover={status === 'idle' ? { scale: 1.02, y: -2 } : {}}
          whileTap={status === 'idle' ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center justify-center space-x-2">
            {status === 'success' && <CheckCircle className="w-5 h-5" />}
            {status === 'error' && <AlertCircle className="w-5 h-5" />}
            {status === 'idle' && <Send className="w-5 h-5" />}
            <span>
              {status === 'success' ? 'Email Client Opened!' :
               status === 'error' ? 'Try Again' :
               'Open Email App'}
            </span>
          </div>
        </motion.button>

        {/* Status Message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`text-center p-4 rounded-lg ${
                status === 'success' ? 'bg-green-600/20 text-green-400' :
                status === 'error' ? 'bg-red-600/20 text-red-400' :
                'bg-zinc-700/50 text-zinc-300'
              }`}
            >
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}