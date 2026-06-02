CREATE DATABASE IF NOT EXISTS vor_enterprise
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vor_enterprise;

-- Tabla de departamentos de Colombia
CREATE TABLE IF NOT EXISTS departments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_department_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ciudades/municipios de Colombia
CREATE TABLE IF NOT EXISTS municipalities (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_department (department_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kyc_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kyc_type VARCHAR(30) NOT NULL DEFAULT 'PERSONA_NATURAL',
  full_name VARCHAR(180) NOT NULL,
  document_type VARCHAR(40) NOT NULL,
  document_number VARCHAR(80) NOT NULL,
  nationality VARCHAR(80) NOT NULL DEFAULT '',
  department_id INT UNSIGNED NULL,
  municipality_id INT UNSIGNED NULL,
  city VARCHAR(120) NOT NULL DEFAULT '',
  address VARCHAR(220) NOT NULL DEFAULT '',
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  source_of_funds TEXT NULL,
  password_hash VARCHAR(255) NULL,
  company_name VARCHAR(200) NULL,
  legal_representative VARCHAR(200) NULL,
  tax_id VARCHAR(80) NULL,
  beneficial_owners VARCHAR(40) NULL,
  notes TEXT NULL,
  accepted_policy TINYINT(1) NOT NULL DEFAULT 0,
  cc_pdf_path VARCHAR(255) NULL,
  rut_pdf_path VARCHAR(255) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kyc_document (document_type, document_number),
  UNIQUE KEY uq_kyc_email (email),
  KEY idx_department (department_id),
  KEY idx_municipality (municipality_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar departamentos de Colombia
INSERT INTO departments (code, name) VALUES
('05', 'Antioquia'),
('08', 'Atlántico'),
('11', 'Bogotá D.C.'),
('13', 'Bolívar'),
('15', 'Boyacá'),
('17', 'Caldas'),
('18', 'Caquetá'),
('19', 'Cauca'),
('20', 'Cesar'),
('23', 'Córdoba'),
('25', 'Cundinamarca'),
('27', 'Chocó'),
('41', 'Huila'),
('44', 'La Guajira'),
('47', 'Magdalena'),
('50', 'Meta'),
('52', 'Nariño'),
('54', 'Norte de Santander'),
('63', 'Quindío'),
('66', 'Risaralda'),
('68', 'Santander'),
('70', 'Sucre'),
('73', 'Tolima'),
('76', 'Valle del Cauca'),
('81', 'Arauca'),
('85', 'Casanare'),
('86', 'Putumayo'),
('88', 'San Andrés y Providencia'),
('91', 'Amazonas'),
('94', 'Guainía'),
('95', 'Guaviare'),
('97', 'Vaupés'),
('99', 'Vichada')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insertar municipios principales por departamento
INSERT INTO municipalities (department_id, name) VALUES
-- Antioquia (id: 1)
((SELECT id FROM departments WHERE code='05'), 'Medellín'),
((SELECT id FROM departments WHERE code='05'), 'Bello'),
((SELECT id FROM departments WHERE code='05'), 'Itagüí'),
((SELECT id FROM departments WHERE code='05'), 'Envigado'),
((SELECT id FROM departments WHERE code='05'), 'Apartadó'),
((SELECT id FROM departments WHERE code='05'), 'Turbo'),
((SELECT id FROM departments WHERE code='05'), 'Rionegro'),
((SELECT id FROM departments WHERE code='05'), 'Sabaneta'),
-- Atlántico (id: 2)
((SELECT id FROM departments WHERE code='08'), 'Barranquilla'),
((SELECT id FROM departments WHERE code='08'), 'Soledad'),
((SELECT id FROM departments WHERE code='08'), 'Malambo'),
((SELECT id FROM departments WHERE code='08'), 'Sabanalarga'),
((SELECT id FROM departments WHERE code='08'), 'Puerto Colombia'),
-- Bogotá D.C. (id: 3)
((SELECT id FROM departments WHERE code='11'), 'Bogotá'),
-- Bolívar (id: 4)
((SELECT id FROM departments WHERE code='13'), 'Cartagena'),
((SELECT id FROM departments WHERE code='13'), 'Magangué'),
((SELECT id FROM departments WHERE code='13'), 'Turbaco'),
((SELECT id FROM departments WHERE code='13'), 'Arjona'),
-- Boyacá (id: 5)
((SELECT id FROM departments WHERE code='15'), 'Tunja'),
((SELECT id FROM departments WHERE code='15'), 'Duitama'),
((SELECT id FROM departments WHERE code='15'), 'Sogamoso'),
((SELECT id FROM departments WHERE code='15'), 'Chiquinquirá'),
-- Caldas (id: 6)
((SELECT id FROM departments WHERE code='17'), 'Manizales'),
((SELECT id FROM departments WHERE code='17'), 'Villamaría'),
((SELECT id FROM departments WHERE code='17'), 'La Dorada'),
-- Caquetá (id: 7)
((SELECT id FROM departments WHERE code='18'), 'Florencia'),
((SELECT id FROM departments WHERE code='18'), 'San Vicente del Caguán'),
-- Cauca (id: 8)
((SELECT id FROM departments WHERE code='19'), 'Popayán'),
((SELECT id FROM departments WHERE code='19'), 'Santander de Quilichao'),
((SELECT id FROM departments WHERE code='19'), 'Puerto Tejada'),
-- Cesar (id: 9)
((SELECT id FROM departments WHERE code='20'), 'Valledupar'),
((SELECT id FROM departments WHERE code='20'), 'Aguachica'),
((SELECT id FROM departments WHERE code='20'), 'Bosconia'),
-- Córdoba (id: 10)
((SELECT id FROM departments WHERE code='23'), 'Montería'),
((SELECT id FROM departments WHERE code='23'), 'Cereté'),
((SELECT id FROM departments WHERE code='23'), 'Lorica'),
-- Cundinamarca (id: 11)
((SELECT id FROM departments WHERE code='25'), 'Soacha'),
((SELECT id FROM departments WHERE code='25'), 'Facatativá'),
((SELECT id FROM departments WHERE code='25'), 'Zipaquirá'),
((SELECT id FROM departments WHERE code='25'), 'Chía'),
((SELECT id FROM departments WHERE code='25'), 'Fusagasugá'),
((SELECT id FROM departments WHERE code='25'), 'Girardot'),
-- Chocó (id: 12)
((SELECT id FROM departments WHERE code='27'), 'Quibdó'),
-- Huila (id: 13)
((SELECT id FROM departments WHERE code='41'), 'Neiva'),
((SELECT id FROM departments WHERE code='41'), 'Pitalito'),
((SELECT id FROM departments WHERE code='41'), 'Garzón'),
-- La Guajira (id: 14)
((SELECT id FROM departments WHERE code='44'), 'Riohacha'),
((SELECT id FROM departments WHERE code='44'), 'Maicao'),
-- Magdalena (id: 15)
((SELECT id FROM departments WHERE code='47'), 'Santa Marta'),
((SELECT id FROM departments WHERE code='47'), 'Ciénaga'),
-- Meta (id: 16)
((SELECT id FROM departments WHERE code='50'), 'Villavicencio'),
((SELECT id FROM departments WHERE code='50'), 'Acacías'),
((SELECT id FROM departments WHERE code='50'), 'Granada'),
-- Nariño (id: 17)
((SELECT id FROM departments WHERE code='52'), 'Pasto'),
((SELECT id FROM departments WHERE code='52'), 'Tumaco'),
((SELECT id FROM departments WHERE code='52'), 'Ipiales'),
-- Norte de Santander (id: 18)
((SELECT id FROM departments WHERE code='54'), 'Cúcuta'),
((SELECT id FROM departments WHERE code='54'), 'Ocaña'),
((SELECT id FROM departments WHERE code='54'), 'Villa del Rosario'),
-- Quindío (id: 19)
((SELECT id FROM departments WHERE code='63'), 'Armenia'),
((SELECT id FROM departments WHERE code='63'), 'Calarcá'),
((SELECT id FROM departments WHERE code='63'), 'La Tebaida'),
-- Risaralda (id: 20)
((SELECT id FROM departments WHERE code='66'), 'Pereira'),
((SELECT id FROM departments WHERE code='66'), 'Dosquebradas'),
((SELECT id FROM departments WHERE code='66'), 'Santa Rosa de Cabal'),
-- Santander (id: 21)
((SELECT id FROM departments WHERE code='68'), 'Bucaramanga'),
((SELECT id FROM departments WHERE code='68'), 'Floridablanca'),
((SELECT id FROM departments WHERE code='68'), 'Girón'),
((SELECT id FROM departments WHERE code='68'), 'Piedecuesta'),
((SELECT id FROM departments WHERE code='68'), 'Barrancabermeja'),
-- Sucre (id: 22)
((SELECT id FROM departments WHERE code='70'), 'Sincelejo'),
((SELECT id FROM departments WHERE code='70'), 'Corozal'),
-- Tolima (id: 23)
((SELECT id FROM departments WHERE code='73'), 'Ibagué'),
((SELECT id FROM departments WHERE code='73'), 'Espinal'),
((SELECT id FROM departments WHERE code='73'), 'Melgar'),
-- Valle del Cauca (id: 24)
((SELECT id FROM departments WHERE code='76'), 'Cali'),
((SELECT id FROM departments WHERE code='76'), 'Palmira'),
((SELECT id FROM departments WHERE code='76'), 'Buenaventura'),
((SELECT id FROM departments WHERE code='76'), 'Tuluá'),
((SELECT id FROM departments WHERE code='76'), 'Buga'),
((SELECT id FROM departments WHERE code='76'), 'Cartago'),
-- Arauca (id: 25)
((SELECT id FROM departments WHERE code='81'), 'Arauca'),
-- Casanare (id: 26)
((SELECT id FROM departments WHERE code='85'), 'Yopal'),
-- Putumayo (id: 27)
((SELECT id FROM departments WHERE code='86'), 'Mocoa'),
-- San Andrés y Providencia (id: 28)
((SELECT id FROM departments WHERE code='88'), 'San Andrés'),
-- Amazonas (id: 29)
((SELECT id FROM departments WHERE code='91'), 'Leticia'),
-- Guainía (id: 30)
((SELECT id FROM departments WHERE code='94'), 'Inírida'),
-- Guaviare (id: 31)
((SELECT id FROM departments WHERE code='95'), 'San José del Guaviare'),
-- Vaupés (id: 32)
((SELECT id FROM departments WHERE code='97'), 'Mitú'),
-- Vichada (id: 33)
((SELECT id FROM departments WHERE code='99'), 'Puerto Carreño')
ON DUPLICATE KEY UPDATE name=VALUES(name);
