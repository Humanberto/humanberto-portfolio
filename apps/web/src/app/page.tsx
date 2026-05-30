import { Badge, Button, GradientText } from "@humanberto/ui";

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-6 text-center">
      <Badge>Foundation online</Badge>
      <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] sm:text-7xl">
        Turning messy processes into{" "}
        <GradientText>clean experiences</GradientText>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Product designer and Python developer. Data, design, and shipped
        products - with an AI advocate ready to make the case.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg">Talk to my AI advocate</Button>
        <Button size="lg" variant="outline">
          See the work
        </Button>
      </div>
    </main>
  );
}
