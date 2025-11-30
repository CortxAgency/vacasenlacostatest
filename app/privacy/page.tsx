export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-24">
            <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
            <div className="prose prose-slate max-w-none">
                <p className="lead text-xl text-muted-foreground mb-8">
                    En Vacas en la Costa, nos tomamos muy en serio la privacidad de tus datos. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Información que recopilamos</h2>
                <p>
                    Recopilamos información que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, número de teléfono y detalles de las propiedades que publicas.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Uso de la información</h2>
                <p>
                    Utilizamos tu información para:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Facilitar la conexión entre propietarios e inquilinos.</li>
                    <li>Mejorar y personalizar nuestros servicios.</li>
                    <li>Enviarte notificaciones importantes sobre tu cuenta o transacciones.</li>
                    <li>Cumplir con obligaciones legales.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Protección de datos</h2>
                <p>
                    Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra el acceso no autorizado, la pérdida o la alteración.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cookies</h2>
                <p>
                    Utilizamos cookies para mejorar tu experiencia de navegación y analizar el tráfico del sitio. Puedes configurar tu navegador para rechazar las cookies, pero esto podría limitar algunas funcionalidades.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contacto</h2>
                <p>
                    Si tienes preguntas sobre esta política, contáctanos a través de nuestro formulario de soporte o enviando un correo a privacidad@vacasenlacosta.com.
                </p>

                <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
                    Última actualización: Noviembre 2025
                </p>
            </div>
        </div>
    )
}
