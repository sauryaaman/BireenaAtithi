import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, User, Quote } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Food Critic',
    content:
      'The attention to detail in every dish is remarkable. BIREENA अतिथि has redefined fine dining with their innovative approach to traditional cuisine.',
    rating: 5,
    image: null,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Food Blogger',
    content:
      'An exceptional dining experience from start to finish. The ambiance, service, and most importantly, the food, are all outstanding.',
    rating: 5,
    image: null,
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Regular Customer',
    content:
      "I've been coming here for years, and the quality has never wavered. The new menu items are always exciting while the classics remain perfect.",
    rating: 5,
    image: null,
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Chef & Restaurant Owner',
    content:
      'As a fellow chef, I am thoroughly impressed by the culinary expertise and creativity displayed in each dish. The fusion of flavors is masterful.',
    rating: 5,
    image: null,
  },
  {
    id: 5,
    name: 'Sophie Anderson',
    role: 'Food & Wine Enthusiast',
    content:
      "The wine pairing suggestions were perfect, and the staff's knowledge of both food and wine is exceptional. A truly memorable dining experience.",
    rating: 5,
    image: null,
  },
  {
    id: 6,
    name: 'James Kim',
    role: 'Travel Blogger',
    content:
      'Having dined at restaurants worldwide, I can confidently say that BIREENA अतिथि stands among the best. The cultural fusion in their dishes is unparalleled.',
    rating: 5,
    image: null,
  },
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-xl"
    >
      <div className="relative">
        <div className="absolute -left-4 -top-4">
          <Quote
            className="h-8 w-8 rotate-180 text-primary/20 transition-colors duration-300 group-hover:text-primary"
            strokeWidth={1}
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-primary/10">
            <div className="flex h-full w-full items-center justify-center bg-primary/5">
              <User className="h-14 w-14 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <p className="mb-8 text-center text-lg leading-relaxed text-dark/80">
            {testimonial.content}
          </p>

          <div className="mb-4 flex justify-center gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-primary text-primary"
                strokeWidth={1}
              />
            ))}
          </div>

          <div className="text-center">
            <h4 className="mb-1 text-xl font-semibold text-dark">
              {testimonial.name}
            </h4>
            <p className="text-sm font-medium text-primary/80">
              {testimonial.role}
            </p>
          </div>
        </div>

        <div className="absolute -bottom-4 -right-4">
          <Quote
            className="h-8 w-8 text-primary/20 transition-colors duration-300 group-hover:text-primary"
            strokeWidth={1}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const Testimonials = () => {
  return (
    <section className="to-gradient-red/10 relative bg-gradient-to-r from-white via-white py-24">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-dark md:text-4xl lg:text-5xl">
            What Our <span className="text-primary">Guests</span> Say
          </h2>
          <p className="text-lg text-dark/70">
            Read what our valued customers have to say about their dining
            experience at BIREENA अतिथि.
          </p>
        </div>

        <div className="testimonials-slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={3}
            initialSlide={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              bulletActiveClass: '!bg-primary !w-8',
              bulletClass: 'swiper-pagination-bullet !bg-primary/20 !w-4',
            }}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
              disabledClass: 'opacity-50 cursor-not-allowed',
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-14"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="swiper-button-prev absolute left-0 top-1/2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-primary/5"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </motion.button>
          </div>

          <div className="swiper-button-next absolute right-0 top-1/2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-primary/5"
            >
              <ChevronRight className="h-6 w-6 text-primary" />
            </motion.button>
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-slider {
          position: relative;
          padding: 0 40px;
        }
        .swiper {
          padding-bottom: 50px !important;
        }
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-pagination-bullet {
          height: 8px;
          border-radius: 4px;
          transition: all 0.3s ease;
          opacity: 1;
          background: rgba(220, 38, 38, 0.2) !important;
        }
        .swiper-pagination-bullet-active {
          background: rgb(220, 38, 38) !important;
          width: 32px !important;
        }
        .swiper-button-prev,
        .swiper-button-next {
          transform: translateY(-50%);
          width: auto !important;
          height: auto !important;
          margin-top: -30px;
        }
        .swiper-button-prev.swiper-button-disabled,
        .swiper-button-next.swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .testimonials-slider {
            padding: 0 20px;
          }
        }
      `}</style>
    </section>
  );
};
