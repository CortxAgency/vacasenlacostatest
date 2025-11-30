export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-24">
            <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
            <div className="prose prose-slate max-w-none">
                <p className="lead text-xl text-muted-foreground mb-8">
                    Bienvenido a Vacas en la Costa. Al utilizar nuestra plataforma, aceptas cumplir con los siguientes términos y condiciones.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Aceptación de los términos</h2>
                <p>
                    Al acceder o utilizar nuestros servicios, aceptas estar legalmente vinculado por estos términos. Si no estás de acuerdo con alguna parte, no debes utilizar nuestros servicios.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Uso de la plataforma</h2>
                <p>
                    Te comprometes a utilizar la plataforma solo para fines legales y de acuerdo con estos términos. Está prohibido:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Publicar contenido falso, engañoso o fraudulento.</li>
                    <li>Acosar o dañar a otros usuarios.</li>
                    <li>Intentar acceder sin autorización a nuestros sistemas.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Responsabilidad de los usuarios</h2>
                <p>
                    Los propietarios son responsables de la veracidad de la información de sus propiedades. Los inquilinos son responsables de verificar la información antes de realizar cualquier transacción. Vacas en la Costa actúa solo como intermediario de información y no garantiza la concreción de los alquileres.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propiedad Intelectual</h2>
                <p>
                    Todo el contenido de la plataforma, incluyendo textos, gráficos, logos e imágenes, es propiedad de Vacas en la Costa o de sus licenciantes y está protegido por leyes de propiedad intelectual.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Modificaciones</h2>
                <p>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos a través de la plataforma o por correo electrónico.
                </p>

                <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
                    Última actualización: Noviembre 2025
                </p>
            </div>
        </div>
    )
}
