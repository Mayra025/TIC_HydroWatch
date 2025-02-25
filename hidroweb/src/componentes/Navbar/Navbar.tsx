import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuList, Flex, Avatar, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { MdNotificationsNone } from "react-icons/md";
import { FaEnvira } from "react-icons/fa6";
import { TbHeartRateMonitor } from "react-icons/tb";
import { LiaChartBar } from "react-icons/lia";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import styled from 'styled-components';
import Logo from "../../assets/lo.png";


export const NavbarContainer = styled.div`
    width: 100%;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    font-weight: bold;
    gap: 10px;
    font-size: 29px;
    color: white;
    margin-left:25px
`;

export const NavItem = styled(Link) <{ selected: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
    color: ${({ selected }) => (selected ? 'white' : 'gray')};
    color: white${({ selected }) => (selected ? 'white' : '#11047A')};
    position: relative;

    svg {
        font-size: 30px;
    }

    span {
        opacity: 0;
        position: absolute;
        top: 40px;
        background-color: #06b863;
        color: white;
        padding: 5px;
        border-radius: 5px;
        transition: opacity 0.2s ease-in-out;
    }

    &:hover span {
        opacity: 1;
    }

    &:hover {
        color: white;
    }
`;

const Navbar: React.FC = () => {
    const [userData, setUserData] = useState<{ nombre: string; photoURL: string | null } | null>(null);
    const auth = getAuth();
    const firestore = getFirestore();
    const navigate = useNavigate();

    const location = useLocation();
    const [selected, setSelected] = useState(location.pathname);

    useEffect(() => {
        setSelected(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(firestore, "Hidrocultores", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as { nombre: string; photoURL: string | null });
                }
            }
        };


        fetchUserData();
    }, [auth, firestore]);

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log("User signed out.");
                navigate("/login");
            })
            // .catch((error) => {
            //     console.error("Error signing out: ", error);
            //     alert("Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo.");
            // });
    };

    const handleProfile = () => navigate("/app/profile");
    const handleNotif = () => navigate("/app/notifications");

    const menuBg = useColorModeValue("white", "gray.800");
    const shadow = useColorModeValue("lg", "dark-lg");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.700", "white");

    const getInitials = (name: string) => {
        const nameInitial = name.charAt(0).toUpperCase();
        return `${nameInitial}`;
    };

    const initials = userData ? getInitials(userData.nombre) : '';

    const [currentTime, setCurrentTime] = useState(new Date());

    // Actualizar la hora cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Limpiar el intervalo 
        return () => clearInterval(timer);
    }, []);

    // Formatear la fecha y la hora
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES');
    };

    return (
        <NavbarContainer>
            <IconWrapper>
                <img src={Logo} alt="PNG icon" className="App-logo" width={35} height={35} />
                <span style={{ fontStyle: "italic" }}>HydroWatch</span>
            </IconWrapper>

            <Flex flex="1" justifyContent="center" alignItems="center">
                <NavItem to="/app/dashboard" selected={selected === "/app/dashboard"}>
                    <Icon as={TbHeartRateMonitor} />
                    <span>Dashboard</span>
                </NavItem>

                <NavItem to="/app/crop" selected={selected === "/app/crop"}>
                    <Icon as={FaEnvira} />
                    <span>Cultivos</span>
                </NavItem>

                <NavItem to="/app/historics" selected={selected === "/app/historics"}>
                    <Icon as={LiaChartBar} />
                    <span>Consultas</span>
                </NavItem>
            </Flex>

            <div>
                <Flex w={{ sm: '100%', md: 'auto' }} alignItems="center" flexDirection="row">
                    <Menu>
                        <div style={{ textAlign: 'center', margin: '20px', color: 'white', fontSize: '15px' }}>

                            <h2> <b>Hoy: </b> {formatDate(currentTime)}</h2>
                            <h3>{formatTime(currentTime)}</h3>
                        </div>
                    </Menu>
                    <Menu>
                        <MenuButton w="35px" h="40px" _hover={{ bg: "#06b863" }} onClick={handleNotif}>
                            <Icon as={MdNotificationsNone} w="28px" h="28px" color="white" />
                        </MenuButton>
                    </Menu>
                    <Menu>
                        <MenuButton p="0px">
                            <Avatar
                                color="white"
                                name={userData ? `${userData.nombre}` : 'User'}
                                bg="#06b863"

                                size="sm"
                                w="40px"
                                h="40px"
                            >
                                {userData ? initials : ''}
                            </Avatar>
                        </MenuButton>
                        <MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
                            <Flex w="100%" mb="0px">
                                <Text ps="20px" pt="16px" pb="10px" w="100%" borderBottom="1px solid" borderColor={borderColor} fontSize="sm" fontWeight="700" color={textColor}>
                                    👋 Hey, {userData ? userData.nombre : 'User'}
                                </Text>
                            </Flex>
                            <Flex flexDirection="column" p="10px">
                                <MenuItem _hover={{ bg: 'none' }} borderRadius="8px" onClick={handleProfile}>
                                    <Text fontSize="sm">Configuración de Perfil</Text>
                                </MenuItem>
                                <MenuItem
                                    _hover={{ bg: 'none' }}
                                    color="red.400"
                                    borderRadius="8px"
                                    onClick={handleLogout}
                                    aria-label="Cerrar sesión"
                                >
                                    <Text fontSize="sm">Salir</Text>
                                </MenuItem>

                            </Flex>
                        </MenuList>
                    </Menu>
                </Flex>
            </div>
        </NavbarContainer>
    );
};

export default Navbar;