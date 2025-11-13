// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import * as yup from 'yup';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { motion } from 'framer-motion';
// import emailjs from '@emailjs/browser';

// const schema = yup.object().shape({
//   name: yup.string().required('Please enter your name'),
//   email: yup
//     .string()
//     .email('Please enter a valid email')
//     .required('Email is required'),
//   message: yup.string().required('Please enter your message'),
//   subject: yup.string().required('Please enter a subject'),
// });

// export const ContactForm = () => {
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [isError, setIsError] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(schema),
//   });

//   const onSubmit = async (data) => {
//     try {
//       // First, let's try EmailJS
//       const templateParams = {
//         from_name: data.name,
//         from_email: data.email,
//         subject: data.subject,
//         message: data.message,
//         to_name: 'Admin', // You can customize this
//       };

//       const response = await emailjs.send(
//         'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
//         'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
//         templateParams,
//         'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
//       );

//       if (response.status === 200) {
//         setIsSuccess(true);
//         reset();
//         setTimeout(() => setIsSuccess(false), 5000);
//       } else {
//         console.error('Failed to send email:', response);
//         setIsError(true);
//         setTimeout(() => setIsError(false), 5000);
//       }
//     } catch (error) {
//       console.error('Error sending email:', error);
//       setIsError(true);
//       setTimeout(() => setIsError(false), 5000);
//     }
//   };

//   return (
//     <section className="relative overflow-hidden bg-gradient-to-tr from-primary/5 via-white to-white py-24">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
//       <div className="container relative">
//         <div className="mx-auto max-w-3xl">
//           <div className="mb-12 text-center">
//             <h2 className="mb-6 text-3xl font-bold text-dark md:text-4xl lg:text-5xl">
//               Get in <span className="text-primary">Touch</span>
//             </h2>
//             <p className="text-lg text-dark/70">
//               Have a question or want to make a reservation? Send us a message
//               and we'll get back to you soon.
//             </p>
//           </div>

//           <motion.form
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="space-y-6 rounded-2xl border border-primary/20 bg-white/80 p-8 shadow-xl backdrop-blur-sm"
//             action="https://api.web3forms.com/submit"
//             onSubmit={handleSubmit(onSubmit)}
//           >
//             <input
//               type="hidden"
//               name="access_key"
//               value="14bbe7fc-4273-46e8-9c16-f678cf9f42c1"
//             />
//             <div>
//               <label
//                 htmlFor="name"
//                 className="mb-2 block text-sm font-medium text-dark"
//               >
//                 Your Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 className={
//                   'w-full rounded-lg border ' +
//                   (errors.name ? 'border-red-500' : 'border-primary/20') +
//                   ' bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//                 }
//                 {...register('name')}
//               />
//               {errors.name && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.name.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-2 block text-sm font-medium text-dark"
//               >
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 className={
//                   'w-full rounded-lg border ' +
//                   (errors.email ? 'border-red-500' : 'border-primary/20') +
//                   ' bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//                 }
//                 {...register('email')}
//               />
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="subject"
//                 className="mb-2 block text-sm font-medium text-dark"
//               >
//                 Subject
//               </label>
//               <input
//                 type="text"
//                 id="subject"
//                 className={
//                   'w-full rounded-lg border ' +
//                   (errors.subject ? 'border-red-500' : 'border-primary/20') +
//                   ' bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//                 }
//                 {...register('subject')}
//               />
//               {errors.subject && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.subject.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="message"
//                 className="mb-2 block text-sm font-medium text-dark"
//               >
//                 Message
//               </label>
//               <textarea
//                 id="message"
//                 rows={4}
//                 className={
//                   'w-full rounded-lg border ' +
//                   (errors.message ? 'border-red-500' : 'border-primary/20') +
//                   ' bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//                 }
//                 {...register('message')}
//               />
//               {errors.message && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.message.message}
//                 </p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary/70"
//             >
//               {isSubmitting ? 'Sending...' : 'Send Message'}
//             </button>

//             {isSuccess && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="mt-4 rounded-lg bg-green-100 p-4 text-green-700"
//               >
//                 Thank you for your message! We'll get back to you soon.
//               </motion.div>
//             )}

//             {isError && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="mt-4 rounded-lg bg-red-100 p-4 text-red-700"
//               >
//                 Sorry, there was an error sending your message. Please try
//                 again.
//               </motion.div>
//             )}
//           </motion.form>
//         </div>
//       </div>
//     </section>
//   );
// };


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const schema = yup.object().shape({
  name: yup.string().required('Please enter your name'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  message: yup.string().required('Please enter your message'),
  subject: yup.string().required('Please enter a subject'),
});

export const ContactForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      // First, let's try EmailJS
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        to_name: 'Admin', // You can customize this
      };

      const response = await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      if (response.status === 200) {
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        console.error('Failed to send email:', response);
        setIsError(true);
        setTimeout(() => setIsError(false), 5000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setIsError(true);
      setTimeout(() => setIsError(false), 5000);
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      <div className="absolute right-0 top-1/4 h-64 w-64 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl rounded-full" />
      <div className="absolute left-0 bottom-1/4 h-64 w-64 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl rounded-full" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Get in{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-lg text-gray-400">
              Have a question or want to make a reservation? Send us a message
              and we'll get back to you soon.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative space-y-6 rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm overflow-hidden group"
            action="https://api.web3forms.com/submit"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Form background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Form content */}
            <div className="relative z-10 space-y-6">
              <input
                type="hidden"
                name="access_key"
                value="14bbe7fc-4273-46e8-9c16-f678cf9f42c1"
              />
              
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className={
                    'w-full rounded-lg border bg-slate-900/50 px-4 py-3 text-gray-100 transition-all duration-300 ' +
                    (errors.name ? 'border-red-500' : 'border-cyan-500/20') +
                    ' focus:border-cyan-400 focus:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-gray-500'
                  }
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className={
                    'w-full rounded-lg border bg-slate-900/50 px-4 py-3 text-gray-100 transition-all duration-300 ' +
                    (errors.email ? 'border-red-500' : 'border-cyan-500/20') +
                    ' focus:border-cyan-400 focus:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-gray-500'
                  }
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className={
                    'w-full rounded-lg border bg-slate-900/50 px-4 py-3 text-gray-100 transition-all duration-300 ' +
                    (errors.subject ? 'border-red-500' : 'border-cyan-500/20') +
                    ' focus:border-cyan-400 focus:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-gray-500'
                  }
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className={
                    'w-full rounded-lg border bg-slate-900/50 px-4 py-3 text-gray-100 transition-all duration-300 ' +
                    (errors.message ? 'border-red-500' : 'border-cyan-500/20') +
                    ' focus:border-cyan-400 focus:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-gray-500 resize-none'
                  }
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-6 py-3 text-center text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-20" />
              </button>

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative mt-4 overflow-hidden rounded-lg border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                  <p className="relative text-green-400">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </motion.div>
              )}

              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative mt-4 overflow-hidden rounded-lg border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
                  <p className="relative text-red-400">
                    Sorry, there was an error sending your message. Please try again.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};