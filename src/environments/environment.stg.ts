/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  dosimetriaSelectorPeriodoManual: true,
  // Same-origin HTTPS via nginx (stg). HTTP a IPs 172.17.x lo bloquean Chrome y Safari privado (mixed content).
  USUARIOS_SERVICE: 'https://siveeic-pruebas.minenergia.gov.co/api/',
  REGISTROS_SERVICE: 'https://siveeic-pruebas.minenergia.gov.co/api/',
  CONSENTIMIENTO_SERVICE: 'https://siveeic-pruebas.minenergia.gov.co/api/',
  FILES_SERVICE: 'https://siveeic-pruebas.minenergia.gov.co:3010/',
  REGISTROS_SERVICE_CARGA: 'https://siveeic-pruebas.minenergia.gov.co/apicrg/',
  FILES_SERVICE_CARGA: 'https://siveeic-pruebas.minenergia.gov.co:3010/',
};
