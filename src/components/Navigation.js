import { Container } from "react-bootstrap";
import { Nav } from "react-bootstrap";
import { Navbar } from "react-bootstrap";

//Navigation bar for the user to be able to navigate seemlessly between the pages
const Navigation = () => {
    return (
        <Navbar bg="primary" data-bs-theme="dark">
            <Container>
                <Navbar.Brand href="/">MelodyMatch</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link href="/home">Home</Nav.Link>
                    <Nav.Link href="/explore">Explore</Nav.Link>
                    <Nav.Link href="/create">Post</Nav.Link>
                </Nav>
                </Container>
        </Navbar>
    )
}

export default Navigation;