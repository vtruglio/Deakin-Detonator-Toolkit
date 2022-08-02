import {
    AppShell,
    Burger,
    Center,
    ColorScheme,
    ColorSchemeProvider,
    Header,
    MantineProvider,
    MediaQuery,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { CVE202141773 } from "./components/CVE-2021-41773/CVE-2021-41773";
import { DirbTool } from "./components/DirbTool/DirbTool";
import Navigation from "./components/NavBar/Navigation";
import NmapTool from "./components/NmapTool/NmapTool";
import SnmpCheck from "./components/SmnpCheck/SmnpCheck";
import AboutPage from "./pages/About";
import { AttackVectors } from "./pages/AttackVectors";
import ToolsPage from "./pages/Tools";

export default function App() {
    const theme = useMantineTheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
    const [opened, setOpened] = useState(false);

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
        setColorScheme(nextColorScheme);
    };

    const toggleOpened = () => {
        setOpened(!opened);
    };

    return (
        <div className="App">
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                    <AppShell
                        navbarOffsetBreakpoint="sm"
                        asideOffsetBreakpoint="sm"
                        fixed
                        navbar={<Navigation hidden={!opened} onNavBarClickCallback={toggleOpened} />}
                        header={
                            <Header height={70} p="md">
                                <Center inline>
                                    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                                        <Burger
                                            opened={opened}
                                            onClick={toggleOpened}
                                            size="sm"
                                            color={theme.colors.gray[6]}
                                            mr="xl"
                                        />
                                    </MediaQuery>
                                    <Text className={"large-text"} inherit variant="gradient" component="span">
                                        Deakin Detonator Toolkit
                                    </Text>
                                </Center>
                            </Header>
                        }
                    >
                        <Routes>
                            <Route path="/" element={<AboutPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/tools" element={<ToolsPage />} />
                            <Route path="/tools/nmap" element={<NmapTool />} />
                            <Route path="/tools/snmp-check" element={<SnmpCheck />} />
                            <Route path="/tools/dirb" element={<DirbTool />} />
                            <Route path="/attack-vectors" element={<AttackVectors />} />
                            <Route path="/attack-vectors/cve-2021-41773" element={<CVE202141773 />} />
                        </Routes>
                    </AppShell>
                </MantineProvider>
            </ColorSchemeProvider>
        </div>
    );
}
