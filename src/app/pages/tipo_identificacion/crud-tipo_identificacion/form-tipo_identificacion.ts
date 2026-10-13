
export let FORM_TIPO_IDENTIFICACION = {
    titulo: 'TipoIdentificacion',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'TipoIdentificacion',
    campos: [
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'Id',
        label_i18n: 'id',
        placeholder_i18n: 'id',
        requerido: true,
        tipo: 'number',
    },
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'NombreIdentificacion',
        label_i18n: 'nombre_identificacion',
        placeholder_i18n: 'nombre_identificacion',
        requerido: true,
        tipo: 'text',
    },
    ],
}
