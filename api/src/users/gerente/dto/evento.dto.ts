export class EventoDTO {
    id_evento: number;
    nome_evento: string;
    descricao: string | null;
    data_criacao: Date;
    data_inicio: Date;
    data_fim: Date;
    estatus: number;
    foto: string;
    id_estabelecimento: number;
    id_endereco: number;
    Evento_Categoria: Array<{id_evento: number, id_categoria: number}>;
}