-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Gegenereerd op: 04 okt 2023 om 15:07
-- Serverversie: 10.4.27-MariaDB
-- PHP-versie: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `testimonia`
--
CREATE DATABASE IF NOT EXISTS `testimonia` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `testimonia`;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `co-maker`
--

CREATE TABLE `co-maker` (
                            `Co-makerID` int(11) NOT NULL,
                            `Naam` varchar(255) NOT NULL,
                            `Uitvoering` date NOT NULL,
                            `Student` int(11) NOT NULL,
                            `Leerjaar` date NOT NULL,
                            `Beschrijving` varchar(255) NOT NULL,
                            `Foto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Gegevens worden geëxporteerd voor tabel `co-maker`
--

INSERT INTO `co-maker` (`Co-makerID`, `Naam`, `Uitvoering`, `Student`, `Leerjaar`, `Beschrijving`, `Foto`) VALUES
    (1, 'Wereld Natuur Fonds', '2023-10-12', 2, '2023-10-02', 'Schilpadden redden', 12313123);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `student`
--

CREATE TABLE `student` (
                           `StudentID` int(11) NOT NULL,
                           `Naam` varchar(50) NOT NULL,
                           `StudentNummer` varchar(8) NOT NULL,
                           `Studie` varchar(60) NOT NULL,
                           `Leeftijd` int(11) NOT NULL,
                           `Is_Geschikt` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Gegevens worden geëxporteerd voor tabel `student`
--

INSERT INTO `student` (`StudentID`, `Naam`, `StudentNummer`, `Studie`, `Leeftijd`, `Is_Geschikt`) VALUES
                                                                                                      (2, 'Joel', 's1234567', 'BIM', 21, 1),
                                                                                                      (3, 'Kees', 's1234568', 'BIM', 22, 1);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `studentmaker`
--

CREATE TABLE `studentmaker` (
                                `StudentMakerID` int(11) NOT NULL,
                                `StudentID` int(11) NOT NULL,
                                `Co-makerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `studentstudie`
--

CREATE TABLE `studentstudie` (
                                 `StudentStudieID` int(11) NOT NULL,
                                 `StudentID` int(11) NOT NULL,
                                 `StudieID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `studie`
--

CREATE TABLE `studie` (
                          `StudieID` int(11) NOT NULL,
                          `StudieNaam` varchar(60) NOT NULL,
                          `Student` date NOT NULL,
                          `Jaar` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Gegevens worden geëxporteerd voor tabel `studie`
--

INSERT INTO `studie` (`StudieID`, `StudieNaam`, `Student`, `Jaar`) VALUES
    (1, 'BIM', '2023-10-03', 2021);

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `co-maker`
--
ALTER TABLE `co-maker`
    ADD PRIMARY KEY (`Co-makerID`);

--
-- Indexen voor tabel `student`
--
ALTER TABLE `student`
    ADD PRIMARY KEY (`StudentID`);

--
-- Indexen voor tabel `studentmaker`
--
ALTER TABLE `studentmaker`
    ADD PRIMARY KEY (`StudentMakerID`),
  ADD KEY `Co-makerID` (`Co-makerID`),
  ADD KEY `StudentID` (`StudentID`);

--
-- Indexen voor tabel `studentstudie`
--
ALTER TABLE `studentstudie`
    ADD PRIMARY KEY (`StudentStudieID`),
  ADD KEY `StudentID` (`StudentID`),
  ADD KEY `StudieID` (`StudieID`);

--
-- Indexen voor tabel `studie`
--
ALTER TABLE `studie`
    ADD PRIMARY KEY (`StudieID`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `co-maker`
--
ALTER TABLE `co-maker`
    MODIFY `Co-makerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT voor een tabel `student`
--
ALTER TABLE `student`
    MODIFY `StudentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT voor een tabel `studentmaker`
--
ALTER TABLE `studentmaker`
    MODIFY `StudentMakerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `studentstudie`
--
ALTER TABLE `studentstudie`
    MODIFY `StudentStudieID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `studie`
--
ALTER TABLE `studie`
    MODIFY `StudieID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Beperkingen voor geëxporteerde tabellen
--

--
-- Beperkingen voor tabel `studentmaker`
--
ALTER TABLE `studentmaker`
    ADD CONSTRAINT `studentmaker_ibfk_1` FOREIGN KEY (`Co-makerID`) REFERENCES `co-maker` (`Co-makerID`),
  ADD CONSTRAINT `studentmaker_ibfk_2` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`);

--
-- Beperkingen voor tabel `studentstudie`
--
ALTER TABLE `studentstudie`
    ADD CONSTRAINT `studentstudie_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`),
  ADD CONSTRAINT `studentstudie_ibfk_2` FOREIGN KEY (`StudieID`) REFERENCES `studie` (`StudieID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
