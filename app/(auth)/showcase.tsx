import { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { Input } from "@components/ui/Input";
import { Avatar } from "@components/ui/Avatar";
import { Badge } from "@components/ui/Badge";
import { LoadingSpinner } from "@components/ui/LoadingSpinner";
import { EmptyState } from "@components/common/EmptyState";
import { ErrorState } from "@components/common/ErrorState";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { Header } from "@components/common/Header";
import { RatingStars } from "@components/maestro/RatingStars";
import { MaestroCardSkeleton } from "@components/maestro/MaestroCardSkeleton";

/**
 * Pantalla de showcase del sistema de diseño.
 * SOLO para desarrollo — no se incluye en producción.
 * Muestra todos los componentes base de la Fase 02.
 */
export default function ShowcaseScreen() {
  const [inputValue, setInputValue] = useState("");
  const [inputWithError, setInputWithError] = useState("");
  const [rating, setRating] = useState(3);

  return (
    <ScrollView className="flex-1 bg-background">
      <Header title="Design System" showBack />

      <View className="px-5 py-6 gap-8">

        {/* ── BUTTONS ─────────────────────────────── */}
        <Section title="Button — variantes">
          <View className="gap-3">
            <Button label="Primary" onPress={() => {}} variant="primary" fullWidth />
            <Button label="Secondary" onPress={() => {}} variant="secondary" fullWidth />
            <Button label="Danger" onPress={() => {}} variant="danger" fullWidth />
            <Button label="Ghost" onPress={() => {}} variant="ghost" fullWidth />
          </View>
        </Section>

        <Section title="Button — tamaños">
          <View className="flex-row gap-3 flex-wrap">
            <Button label="Small" onPress={() => {}} size="sm" />
            <Button label="Medium" onPress={() => {}} size="md" />
            <Button label="Large" onPress={() => {}} size="lg" />
          </View>
        </Section>

        <Section title="Button — estados">
          <View className="gap-3">
            <Button label="Loading" onPress={() => {}} loading fullWidth />
            <Button label="Disabled" onPress={() => {}} disabled fullWidth />
          </View>
        </Section>

        {/* ── CARD ────────────────────────────────── */}
        <Section title="Card">
          <Card>
            <Text className="font-inter-semibold text-text">
              Card normal
            </Text>
            <Text className="font-inter text-text-secondary mt-1">
              Contenido de la tarjeta
            </Text>
          </Card>
          <Card onPress={() => {}} className="mt-3">
            <Text className="font-inter-semibold text-text">
              Card tappable
            </Text>
            <Text className="font-inter text-text-secondary mt-1">
              Toca para interactuar
            </Text>
          </Card>
        </Section>

        {/* ── INPUT ───────────────────────────────── */}
        <Section title="Input">
          <View className="gap-4">
            <Input
              label="Nombre"
              placeholder="Tu nombre completo"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Input
              label="Email (con error)"
              placeholder="correo@ejemplo.com"
              value={inputWithError}
              onChangeText={setInputWithError}
              error="El email no es válido"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value=""
              onChangeText={() => {}}
              secureTextEntry
            />
            <Input
              label="Descripción (multiline)"
              placeholder="Describe el trabajo a realizar..."
              value=""
              onChangeText={() => {}}
              multiline
            />
          </View>
        </Section>

        {/* ── AVATAR ──────────────────────────────── */}
        <Section title="Avatar — con imagen y con iniciales">
          <View className="flex-row gap-4 items-end">
            <View className="items-center gap-2">
              <Avatar uri="https://i.pravatar.cc/120" name="Pedro García" size="sm" />
              <Text className="text-xs text-text-secondary">sm</Text>
            </View>
            <View className="items-center gap-2">
              <Avatar uri={null} name="Pedro García" size="md" />
              <Text className="text-xs text-text-secondary">md</Text>
            </View>
            <View className="items-center gap-2">
              <Avatar uri={null} name="Ana López" size="lg" />
              <Text className="text-xs text-text-secondary">lg</Text>
            </View>
            <View className="items-center gap-2">
              <Avatar uri={null} name="Juan" size="xl" />
              <Text className="text-xs text-text-secondary">xl</Text>
            </View>
          </View>
        </Section>

        {/* ── BADGE ───────────────────────────────── */}
        <Section title="Badge — variantes de estado">
          <View className="flex-row flex-wrap gap-2">
            <Badge label="Pendiente" variant="warning" />
            <Badge label="Aceptada" variant="primary" />
            <Badge label="En curso" variant="primary" />
            <Badge label="Completada" variant="success" />
            <Badge label="Cancelada" variant="neutral" />
            <Badge label="Rechazada" variant="error" />
          </View>
          <View className="flex-row flex-wrap gap-2 mt-2">
            <Badge label="Small" variant="primary" size="sm" />
            <Badge label="Medium" variant="success" size="md" />
          </View>
        </Section>

        {/* ── LOADING SPINNER ─────────────────────── */}
        <Section title="LoadingSpinner">
          <View className="flex-row gap-6 items-center">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </View>
        </Section>

        {/* ── SKELETON ────────────────────────────── */}
        <Section title="SkeletonLoader">
          <View className="gap-2">
            <SkeletonLoader width="80%" height={16} />
            <SkeletonLoader width="60%" height={12} />
            <SkeletonLoader width={200} height={12} />
          </View>
        </Section>

        <Section title="MaestroCardSkeleton">
          <MaestroCardSkeleton />
        </Section>

        {/* ── RATING STARS ────────────────────────── */}
        <Section title="RatingStars">
          <View className="gap-3">
            <RatingStars rating={4.5} showValue />
            <RatingStars rating={3} size={24} showValue />
            <RatingStars
              rating={rating}
              size={28}
              interactive
              onRate={setRating}
              showValue
            />
            <Text className="text-xs text-text-secondary">↑ Interactivo (toca)</Text>
          </View>
        </Section>

        {/* ── EMPTY STATE ─────────────────────────── */}
        <Section title="EmptyState">
          <EmptyState
            icon="search-outline"
            title="No hay resultados"
            message="No encontramos maestros disponibles en tu zona."
            actionLabel="Ampliar búsqueda"
            onAction={() => {}}
          />
        </Section>

        {/* ── ERROR STATE ─────────────────────────── */}
        <Section title="ErrorState">
          <ErrorState onRetry={() => {}} />
        </Section>

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}

// ─── Helper interno ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="text-xs font-inter-semibold text-text-secondary uppercase tracking-widest mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
}
