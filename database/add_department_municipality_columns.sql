-- Script para agregar las columnas department_id y municipality_id a kyc_requests

ALTER TABLE kyc_requests
ADD COLUMN department_id INT UNSIGNED NULL AFTER nationality,
ADD COLUMN municipality_id INT UNSIGNED NULL AFTER department_id;

-- Agregar índices
ALTER TABLE kyc_requests
ADD KEY idx_department (department_id),
ADD KEY idx_municipality (municipality_id);

-- Agregar las foreign keys
ALTER TABLE kyc_requests
ADD CONSTRAINT fk_kyc_requests_department 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_kyc_requests_municipality 
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE SET NULL;
