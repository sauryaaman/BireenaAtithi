// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui';
// import {
//   MessageSquare,
//   PhoneCall,
//   Mail,
//   Clock,
//   CheckCircle,
//   HelpCircle,
//   Settings,
//   Users,
// } from 'lucide-react';

// const services = [
//   {
//     id: 'software-demo',
//     name: 'Software Demo',
//     description: 'See how our software can streamline your hotel operations',
//     icon: CheckCircle,
//   },
//   {
//     id: 'technical-support',
//     name: 'Technical Support',
//     description: 'Get help with technical issues or software configuration',
//     icon: Settings,
//   },
//   {
//     id: 'consultation',
//     name: 'Business Consultation',
//     description: "Discuss your hotel's specific needs and requirements",
//     icon: Users,
//   },
//   {
//     id: 'general-inquiry',
//     name: 'General Inquiry',
//     description: 'Questions about pricing, features, or other information',
//     icon: HelpCircle,
//   },
// ];

// const contactMethods = [
//   {
//     icon: PhoneCall,
//     name: 'Phone Support',
//     description: 'Talk to our support team',
//     value: '+977-9847012345',
//   },
//   {
//     icon: Mail,
//     name: 'Email',
//     description: 'Send us an email',
//     value: 'support@bireenaathiti.com',
//   },
//   {
//     icon: Clock,
//     name: 'Working Hours',
//     description: "We're available",
//     value: 'Sunday - Friday, 9AM to 6PM NPT',
//   },
//   {
//     icon: MessageSquare,
//     name: 'Live Chat',
//     description: 'Chat with our team',
//     value: 'Available during working hours',
//   },
// ];

// export const ContactPage = () => {
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header section */}
//       <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-white py-24 sm:py-32">
//         {/* Background Elements */}
//         <div className="absolute inset-0">
//           <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
//           <div className="absolute right-0 top-0 -translate-y-12 translate-x-12">
//             <div className="h-48 w-48 rounded-full bg-gradient-to-br from-primary/30 to-primary blur-3xl"></div>
//           </div>
//           <div className="absolute bottom-0 left-0 -translate-x-12 translate-y-12">
//             <div className="h-48 w-48 rounded-full bg-gradient-to-tr from-primary/30 to-primary blur-3xl"></div>
//           </div>
//         </div>

//         <div className="container relative">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mx-auto max-w-3xl text-center"
//           >
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="inline-flex items-center rounded-full border border-primary/20 bg-white px-6 py-2 shadow-md"
//             >
//               <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
//               <span className="ml-3 text-sm font-medium text-dark">
//                 We typically respond within 2 hours
//               </span>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//               className="mt-8 text-4xl font-bold tracking-tight text-dark sm:text-5xl lg:text-6xl"
//             >
//               Let's Discuss Your{' '}
//               <span className="text-primary">Hotel's Future</span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className="mt-6 text-xl leading-8 text-dark/70"
//             >
//               Whether you need a demo, technical support, or just want to chat
//               about hotel management solutions, our team is here to help you
//               succeed.
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.5 }}
//               className="mt-10 flex items-center justify-center gap-6"
//             >
//               <div className="rounded-full bg-white/80 p-1 backdrop-blur">
//                 <div className="flex -space-x-2">
//                   {[1, 2, 3, 4].map((i) => (
//                     <div
//                       key={i}
//                       className="h-10 w-10 rounded-full border-2 border-white bg-gray-100"
//                     />
//                   ))}
//                 </div>
//               </div>
//               <div className="text-sm">
//                 <p className="font-medium text-dark">Join our happy clients</p>
//                 <p className="text-dark/70">
//                   Rated 4.9/5 from over 400+ reviews
//                 </p>
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Contact Methods */}
//       <section className="py-16">
//         <div className="container">
//           <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
//             {contactMethods.map((method, index) => (
//               <motion.div
//                 key={method.name}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="rounded-2xl bg-gray-50 p-8"
//               >
//                 <method.icon className="h-8 w-8 text-primary" />
//                 <h3 className="mt-4 text-lg font-semibold text-dark">
//                   {method.name}
//                 </h3>
//                 <p className="mt-2 text-sm text-dark/70">
//                   {method.description}
//                 </p>
//                 <p className="mt-2 text-base font-medium text-primary">
//                   {method.value}
//                 </p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Service Selection and Contact Form */}
//       <section className="bg-gray-50 py-16 sm:py-24">
//         <div className="container">
//           <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
//             {/* Service Selection */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <h2 className="text-2xl font-bold tracking-tight text-dark">
//                 How can we help you?
//               </h2>
//               <p className="mt-4 text-base text-dark/70">
//                 Select a topic so we can connect you with the right team.
//               </p>
//               <div className="mt-8 grid grid-cols-1 gap-4">
//                 {services.map((service) => (
//                   <div
//                     key={service.id}
//                     className="group relative rounded-2xl bg-white p-6 ring-1 ring-gray-200 hover:ring-primary"
//                   >
//                     <div className="flex items-center gap-x-4">
//                       <service.icon className="h-6 w-6 text-primary" />
//                       <h3 className="text-lg font-semibold leading-7 text-dark">
//                         {service.name}
//                       </h3>
//                     </div>
//                     <p className="mt-2 text-sm leading-6 text-dark/70">
//                       {service.description}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* Contact Form */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5 }}
//               className="rounded-2xl bg-white p-8 ring-1 ring-gray-200"
//             >
//               <h2 className="text-2xl font-bold tracking-tight text-dark">
//                 Send us a message
//               </h2>
//               <p className="mt-4 text-base text-dark/70">
//                 Fill out the form below and we'll get back to you as soon as
//                 possible.
//               </p>

//               <form className="mt-8 space-y-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label
//                       htmlFor="name"
//                       className="block text-sm font-medium text-dark"
//                     >
//                       Name
//                     </label>
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       className="mt-2 block w-full rounded-lg border border-gray-200 px-4 py-2 text-dark focus:border-primary focus:ring-primary"
//                       placeholder="Your name"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="email"
//                       className="block text-sm font-medium text-dark"
//                     >
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       className="mt-2 block w-full rounded-lg border border-gray-200 px-4 py-2 text-dark focus:border-primary focus:ring-primary"
//                       placeholder="you@example.com"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="phone"
//                       className="block text-sm font-medium text-dark"
//                     >
//                       Phone Number
//                     </label>
//                     <input
//                       type="tel"
//                       id="phone"
//                       name="phone"
//                       className="mt-2 block w-full rounded-lg border border-gray-200 px-4 py-2 text-dark focus:border-primary focus:ring-primary"
//                       placeholder="Your phone number"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="message"
//                       className="block text-sm font-medium text-dark"
//                     >
//                       Message
//                     </label>
//                     <textarea
//                       id="message"
//                       name="message"
//                       rows={4}
//                       className="mt-2 block w-full rounded-lg border border-gray-200 px-4 py-2 text-dark focus:border-primary focus:ring-primary"
//                       placeholder="How can we help you?"
//                     />
//                   </div>
//                 </div>

//                 <Button type="submit" className="w-full">
//                   Send message
//                 </Button>
//               </form>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Map Section */}
//       <section className="py-16">
//         <div className="container">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//             className="overflow-hidden rounded-2xl bg-gray-50"
//           >
//             <div className="grid grid-cols-1 lg:grid-cols-2">
//               <div className="p-8 lg:p-12">
//                 <h2 className="text-2xl font-bold tracking-tight text-dark">
//                   Visit Our Office
//                 </h2>
//                 <p className="mt-4 text-base text-dark/70">
//                   Come visit us to discuss your needs in person or schedule a
//                   demo of our software.
//                 </p>
//                 <address className="mt-8 space-y-4 text-base not-italic text-dark/70">
//                   <p className="font-semibold">Bireena Info Tech</p>
//                   <p>B36, Mitra Mandal Colony</p>
//                   <p>Vashist Colony, Anisabad</p>
//                   <p>Patna, Bihar</p>
//                   <p>India 800002</p>
//                 </address>
//               </div>
//               <div className="min-h-[400px] bg-gray-200">
//                 <iframe
//                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.8587169852935!2d85.0915787!3d25.576366799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x43d931ec9b428883%3A0xa1137df98dfedf57!2sBireena%20Info%20Tech!5e0!3m2!1sen!2sin!4v1758275103865!5m2!1sen!2sin"
//                   width="100%"
//                   height="100%"
//                   style={{ border: 0 }}
//                   allowFullScreen=""
//                   loading="lazy"
//                   referrerPolicy="no-referrer-when-downgrade"
//                   className="h-full w-full"
//                   title="Office Location Map"
//                 ></iframe>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// };


import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  MessageSquare,
  PhoneCall,
  Mail,
  Clock,
  CheckCircle,
  HelpCircle,
  Settings,
  Users,
} from 'lucide-react';

const services = [
  {
    id: 'software-demo',
    name: 'Software Demo',
    description: 'See how our software can streamline your hotel operations',
    icon: CheckCircle,
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'Get help with technical issues or software configuration',
    icon: Settings,
  },
  {
    id: 'consultation',
    name: 'Business Consultation',
    description: "Discuss your hotel's specific needs and requirements",
    icon: Users,
  },
  {
    id: 'general-inquiry',
    name: 'General Inquiry',
    description: 'Questions about pricing, features, or other information',
    icon: HelpCircle,
  },
];

const contactMethods = [
  {
    icon: PhoneCall,
    name: 'Phone Support',
    description: 'Talk to our support team',
    value: '+977-9847012345',
  },
  {
    icon: Mail,
    name: 'Email',
    description: 'Send us an email',
    value: 'support@bireenaathiti.com',
  },
  {
    icon: Clock,
    name: 'Working Hours',
    description: "We're available",
    value: 'Sunday - Friday, 9AM to 6PM NPT',
  },
  {
    icon: MessageSquare,
    name: 'Live Chat',
    description: 'Chat with our team',
    value: 'Available during working hours',
  },
];

export const ContactPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-5" />
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15),transparent)]" />
        {/* Decorative gradients */}
        <div className="absolute right-0 top-1/4 h-96 w-96 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-[100px] rounded-full" />
        <div className="absolute left-0 bottom-1/4 h-96 w-96 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-[100px] rounded-full" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center rounded-full border border-cyan-500/20 bg-slate-900/50 px-6 py-2 shadow-md backdrop-blur-xl"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-500"></span>
              <span className="ml-3 text-sm font-medium text-slate-300">
                We typically respond within 2 hours
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl"
            >
              Let's Discuss Your{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">Hotel's Future</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-xl leading-8 text-slate-400"
            >
              Whether you need a demo, technical support, or just want to chat
              about hotel management solutions, our team is here to help you
              succeed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex items-center justify-center gap-6"
            >
              <div className="rounded-full bg-slate-800/50 p-1 backdrop-blur-xl ring-1 ring-slate-700/50">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-slate-700 bg-slate-800"
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-300">Join our happy clients</p>
                <p className="text-slate-400">
                  Rated 4.9/5 from over 400+ reviews
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl bg-slate-900/50 p-8 backdrop-blur-xl ring-1 ring-slate-700/50 hover:ring-cyan-500/50 transition-all duration-300"
              >
                <method.icon className="h-8 w-8 text-cyan-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-200">
                  {method.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {method.description}
                </p>
                <p className="mt-2 text-base font-medium text-cyan-400">
                  {method.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Selection and Contact Form */}
      <section className="bg-slate-950/50 py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            {/* Service Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-200">
                How can we help you?
              </h2>
              <p className="mt-4 text-base text-slate-400">
                Select a topic so we can connect you with the right team.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="group relative rounded-2xl bg-slate-900/50 p-6 ring-1 ring-slate-700/50 hover:ring-cyan-500/50 backdrop-blur-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-x-4">
                      <service.icon className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                      <h3 className="text-lg font-semibold leading-7 text-slate-200">
                        {service.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-slate-900/50 p-8 ring-1 ring-slate-700/50 backdrop-blur-xl"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-200">
                Send us a message
              </h2>
              <p className="mt-4 text-base text-slate-400">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <form className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Send message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl ring-1 ring-slate-700/50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <h2 className="text-2xl font-bold tracking-tight text-slate-200">
                  Visit Our Office
                </h2>
                <p className="mt-4 text-base text-slate-400">
                  Come visit us to discuss your needs in person or schedule a
                  demo of our software.
                </p>
                <address className="mt-8 space-y-4 text-base not-italic text-slate-400">
                  <p className="font-semibold text-slate-300">Bireena Info Tech</p>
                  <p>B36, Mitra Mandal Colony</p>
                  <p>Vashist Colony, Anisabad</p>
                  <p>Patna, Bihar</p>
                  <p>India 800002</p>
                </address>
              </div>
              <div className="min-h-[400px] bg-slate-800/50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.8587169852935!2d85.0915787!3d25.576366799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x43d931ec9b428883%3A0xa1137df98dfedf57!2sBireena%20Info%20Tech!5e0!3m2!1sen!2sin!4v1758275103865!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                  title="Office Location Map"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
