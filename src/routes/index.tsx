import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Index,
});

interface Pokemon {
  name: string;
  id: number;
  sprites: { front_default: string; other: { "official-artwork": { front_default: string } } };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

function Index() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setPokemon(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase().trim()}`);
      if (!res.ok) throw new Error("Pokémon no encontrado");
      const data: Pokemon = await res.json();
      setPokemon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const randomPokemon = () => {
    const id = Math.floor(Math.random() * 898) + 1;
    setQuery(String(id));
    setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await res.json();
          setPokemon(data);
        } catch {
          setError("Error al cargar");
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">PokéConsulta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Peticiones HTTP a PokeAPI · Diseño de Aplicaciones Móviles
          </p>
        </header>

        <form onSubmit={fetchPokemon} className="mb-6 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre o ID (ej: pikachu, 25)"
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
          <Button type="button" variant="secondary" onClick={randomPokemon} disabled={loading}>
            Aleatorio
          </Button>
        </form>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-center text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {pokemon && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/40">
              <CardTitle className="flex items-center justify-between capitalize">
                <span>{pokemon.name}</span>
                <span className="text-sm text-muted-foreground">#{pokemon.id.toString().padStart(4, "0")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-center">
                <img
                  src={pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="h-48 w-48 object-contain"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {pokemon.types.map((t) => (
                  <Badge key={t.type.name} variant="secondary" className="capitalize">
                    {t.type.name}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Altura</p>
                  <p className="font-semibold">{pokemon.height / 10} m</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Peso</p>
                  <p className="font-semibold">{pokemon.weight / 10} kg</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((a) => (
                    <Badge key={a.ability.name} variant="outline" className="capitalize">
                      {a.ability.name.replace("-", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Estadísticas base</h3>
                <div className="space-y-2">
                  {pokemon.stats.map((s) => (
                    <div key={s.stat.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{s.stat.name.replace("-", " ")}</span>
                        <span className="font-medium">{s.base_stat}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((s.base_stat / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!pokemon && !error && !loading && (
          <p className="text-center text-sm text-muted-foreground">
            Ingresa el nombre o ID de un Pokémon para consultar la API.
          </p>
        )}
      </div>
    </main>
  );
}
