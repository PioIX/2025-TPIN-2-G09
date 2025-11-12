import Link from "next/link"

export default function Home() {
    return (
        <main>
            <h1>Bienvenido a Pizza!</h1>
            <Link href={"/login"}>Ir a Login</Link>
        </main>
            
            
    )
}