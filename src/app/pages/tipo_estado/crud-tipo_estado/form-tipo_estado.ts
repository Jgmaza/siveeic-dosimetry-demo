
export let FORM_TIPO_ESTADO = {
    titulo: 'TipoEstado',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'TipoEstado',
    campos: [
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'Id',
        label_i18n: 'id',
        placeholder_i18n: 'id',
        requerido: true,
        tipo: 'text',
    },
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'NombreEstado',
        label_i18n: 'nombre_estado',
        placeholder_i18n: 'nombre_estado',
        requerido: true,
        tipo: 'text',
    },
    ],
}
