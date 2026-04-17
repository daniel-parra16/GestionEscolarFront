import { Routes, Route } from "react-router-dom";

function Home() {
    return <h1>Home</h1>;
}

function Login() {
    return <h1>Login</h1>;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}