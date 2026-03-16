import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";

interface TermsSection {
  title: string;
  content: string;
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. Aceptación de los términos",
    content:
      "Al utilizar la aplicación Maestros, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la aplicación.",
  },
  {
    title: "2. Descripción del servicio",
    content:
      'Maestros es una plataforma que conecta a usuarios con profesionales de servicios del hogar ("maestros") en Chile. Actuamos como intermediarios y no somos responsables de la calidad o resultado de los servicios prestados.',
  },
  {
    title: "3. Registro y cuenta",
    content:
      "Para acceder a ciertas funciones, debes autenticarte con tu cuenta de Google. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades que ocurran bajo tu cuenta.",
  },
  {
    title: "4. Solicitudes de servicio",
    content:
      "Al crear una solicitud, te comprometes a proporcionar información veraz y a estar disponible en la fecha y hora indicadas. Las cancelaciones reiteradas pueden resultar en la suspensión de tu cuenta.",
  },
  {
    title: "5. Pagos y tarifas",
    content:
      "Los precios mostrados son referenciales. El pago final se acuerda directamente entre el cliente y el maestro. Maestros no procesa pagos ni cobra comisiones en esta versión de la aplicación.",
  },
  {
    title: "6. Valoraciones y comentarios",
    content:
      "Al publicar una valoración, garantizas que refleja tu experiencia real. Nos reservamos el derecho de eliminar valoraciones falsas, ofensivas o que violen estos términos.",
  },
  {
    title: "7. Privacidad y datos personales",
    content:
      "El uso de tu información personal se rige por nuestra Política de Privacidad. Al usar la app, consientes el tratamiento de tus datos conforme a dicha política y la Ley N° 19.628 sobre Protección de la Vida Privada.",
  },
  {
    title: "8. Limitación de responsabilidad",
    content:
      "Maestros no se hace responsable por daños, pérdidas o perjuicios derivados del uso de la plataforma o de los servicios prestados por los maestros. Nuestra responsabilidad se limita al máximo permitido por la ley chilena.",
  },
  {
    title: "9. Modificaciones",
    content:
      "Podemos actualizar estos términos en cualquier momento. Te notificaremos de cambios significativos mediante la aplicación. El uso continuado de la aplicación después de los cambios implica su aceptación.",
  },
  {
    title: "10. Ley aplicable",
    content:
      "Estos términos se rigen por la legislación chilena. Cualquier disputa será sometida a los tribunales ordinarios de justicia competentes de la ciudad de Santiago, Chile.",
  },
];

/**
 * Modal de Términos y Condiciones — slide-up sheet con scroll.
 *
 * Se abre desde confirm.tsx cuando el usuario toca
 * "Términos de servicio" o "Política de privacidad".
 * Botón "Cerrar" al final (y también al principio como handle tap).
 */
export default function TermsModal() {
  return (
    <View className="flex-1 bg-background/80 justify-end">
      <StatusBar style="dark" />

      <View
        className="bg-background rounded-t-3xl"
        style={{ maxHeight: "92%" }}
      >
        {/* Handle bar — también cierra el modal al tocar */}
        <Pressable
          className="pt-4 pb-2 items-center active:opacity-60"
          onPress={() => goBack("/(client)/request/confirm")}
        >
          <View className="w-10 h-1 bg-border rounded-full" />
        </Pressable>

        {/* Encabezado fijo */}
        <View className="px-6 pb-4 border-b border-border">
          <Text className="text-xl font-inter-bold text-text">
            Términos y Condiciones
          </Text>
          <Text className="text-xs font-inter text-text-secondary mt-1">
            Última actualización: marzo 2025
          </Text>
        </View>

        {/* Contenido con scroll */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
        >
          {/* Introducción */}
          <Text className="text-sm font-inter text-text-secondary leading-relaxed mb-5">
            Bienvenido a Maestros, tu plataforma de servicios del hogar en
            Chile. Por favor, lee atentamente los siguientes términos antes de
            usar la aplicación.
          </Text>

          {/* Secciones */}
          {TERMS_SECTIONS.map((section) => (
            <View key={section.title} className="mb-5">
              <Text className="text-sm font-inter-semibold text-text mb-1">
                {section.title}
              </Text>
              <Text className="text-sm font-inter text-text-secondary leading-relaxed">
                {section.content}
              </Text>
            </View>
          ))}

          {/* Copyright */}
          <Text className="text-xs font-inter text-text-secondary/60 text-center mt-4 mb-2">
            © 2025 Maestros · Todos los derechos reservados
          </Text>
        </ScrollView>

        {/* Botón cerrar fijo al pie */}
        <View
          className="px-6 pb-10 pt-4"
          style={{ borderTopWidth: 1, borderTopColor: "#E5E7EB" }}
        >
          <Pressable
            className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80"
            onPress={() => goBack("/(client)/request/confirm")}
          >
            <Text className="text-white font-inter-semibold">Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
