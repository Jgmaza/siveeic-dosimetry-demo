
export let FORM_TIPO_USUARIO = {
    titulo: 'TipoUsuario',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'TipoUsuario',
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
        nombre: 'NombreTipo',
        label_i18n: 'nombre_tipo',
        placeholder_i18n: 'nombre_tipo',
        requerido: true,
        tipo: 'text',
    },
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'DescTipo',
        label_i18n: 'desc_tipo',
        placeholder_i18n: 'desc_tipo',
        requerido: true,
        tipo: 'text',
    },
    ],
}
