import { motion } from 'framer-motion';
import ownerImage from '../../assets/images/owner.jpg'; // You'll need to add this image
import { Button } from '../../components/ui';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export const Owner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/5 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <div className="relative mx-auto max-w-[500px]">
              <div className="relative z-10 max-h-[500px] overflow-hidden rounded-2xl bg-white/20 p-2 backdrop-blur-sm">
                <img
                  src={ownerImage}
                  alt="Restaurant Owner"
                  className=" w-full rounded-xl object-cover shadow-xl"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary/10" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <h2 className="mb-6 text-3xl font-bold text-dark md:text-4xl lg:text-5xl">
              Meet Our <span className="text-primary">Owner</span>
            </h2>
            <p className="mb-8 text-lg font-medium text-dark/70">
              Passionate about culinary excellence and cultural fusion
            </p>
            <div className="space-y-6 text-dark/70">
              <p>
                With over 15 years of culinary expertise, our owner brings a
                unique blend of traditional recipes and modern innovations to
                <span className="font-devanagari text-primary">
                  {' '}
                  BIREENA अतिथि
                </span>
                .
              </p>
              <p>
                Their journey began in the heart of India, learning ancestral
                cooking techniques and secret family recipes. Today, they
                continue to innovate while preserving the authentic flavors that
                make Indian cuisine special.
              </p>
              <p>
                "My goal is to create not just a restaurant, but a cultural
                experience where every guest feels like family."
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a href="/about">Our Story</a>
                </Button>

                <Button asChild variant="outline">
                  <a
                    href="https://www.instagram.com/bireenainfo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://www.facebook.com/profile.php?id=61572904348705"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="www.youtube.com/@Bireenainfotech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
