'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Home, Key, Calendar, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [textIndex, setTextIndex] = useState(0)
  const texts = ["la playa", "el bosque", "la costa"]

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax feel */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-background z-10" />
          <img
            src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80"
            alt="Costa Argentina"
            className="w-full h-full object-cover animate-slow-zoom"
          />
        </div>

        <div className="container relative z-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8 shadow-lg hover:bg-white/20 transition-colors cursor-default">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-sm font-medium tracking-wide">La plataforma #1 de Vacas en la Costa</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white drop-shadow-xl min-h-[160px] md:min-h-0 flex flex-col md:block items-center">
              <span>Tu lugar en </span>
              <span className="relative inline-flex justify-start min-w-[220px] md:min-w-[300px] h-[1.2em] overflow-hidden align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={textIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute left-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 whitespace-nowrap"
                  >
                    {texts[textIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="invisible">{texts[1]}</span> {/* Spacer based on longest text */}
              </span>
              <br className="hidden md:block" />
              <span className="block mt-2">directo con su dueño.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              Alquileres temporales y ventas en Miramar, Mar del Plata y toda la costa.
              <br className="hidden md:block" />
              Seguridad garantizada y trato directo.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="w-full sm:w-auto">
                <Link href="/search?op=rent">
                  <Button size="lg" className="relative overflow-hidden w-full sm:w-auto text-lg px-10 h-16 rounded-full bg-white text-slate-900 hover:bg-slate-50 hover:scale-105 transition-all shadow-xl shadow-black/20 font-semibold group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <Key className="mr-2 h-5 w-5 text-blue-600 group-hover:rotate-12 transition-transform" />
                    Buscar Alquiler
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={item} className="w-full sm:w-auto">
                <Link href="/search?op=sale">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 h-16 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white hover:scale-105 transition-all font-semibold group">
                    <Home className="mr-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                    Comprar Propiedad
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/80 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-shadow-sm">Explorar</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </div>
        </motion.div>
      </section>

      {/* Value Props Section */}
      <section className="py-32 relative overflow-hidden bg-[#FDFBF7]">
        <div className="container relative z-10 px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
              La forma segura de alquilar en la Costa
            </h2>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Olvidate de las estafas y las comisiones abusivas. Creamos una comunidad de confianza para tus vacaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Search className="h-10 w-10 text-orange-500" />,
                title: "Encontrá tu lugar ideal",
                desc: "Desde departamentos frente al mar hasta casas en el bosque. Filtros reales para necesidades reales.",
                bg: "bg-orange-50/50",
                border: "border-orange-100"
              },
              {
                icon: <ShieldCheck className="h-10 w-10 text-emerald-600" />,
                title: "Verificación de Identidad",
                desc: "Validamos que cada propietario sea quien dice ser. Tu tranquilidad es nuestra prioridad #1.",
                bg: "bg-emerald-50/50",
                border: "border-emerald-100"
              },
              {
                icon: <Zap className="h-10 w-10 text-blue-600" />,
                title: "Trato Directo y Rápido",
                desc: "Sin intermediarios que demoran todo. Hablá directo por WhatsApp y reservá en el momento.",
                bg: "bg-blue-50/50",
                border: "border-blue-100"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-10 rounded-[2rem] border ${feature.border} ${feature.bg} shadow-sm hover:shadow-2xl transition-all duration-300 cursor-default`}
              >
                <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-600/20 to-transparent" />

        <div className="container relative z-10 px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Tenés una propiedad?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Publicá gratis hoy mismo y empezá a recibir consultas de calidad.
            Sin costos fijos ni contratos de exclusividad.
          </p>
          <Link href="/publish">
            <Button size="lg" className="text-lg px-10 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:scale-105 transition-all group">
              Publicar mi Propiedad Gratis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4 text-white">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">A</div>
                <span className="text-xl font-bold">Vacas en la Costa</span>
              </div>
              <p className="max-w-sm text-slate-500">
                La plataforma líder para encontrar tu alojamiento ideal en la costa argentina. Conectamos dueños y viajeros de forma directa y segura.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li><Link href="/search" className="hover:text-white transition-colors">Explorar</Link></li>
                <li><Link href="/publish" className="hover:text-white transition-colors">Publicar Propiedad</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Ingresar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Ayuda</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} Vacas en la Costa. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              {/* Social links placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
