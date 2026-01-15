export interface ITechnicien {
  id: string;
  nom: string;
  email: string;
  competences: string[];
  localisation?: string;
  estActif: boolean;
  limiteHeuresHebdo: number;
}

export interface IDisponibiliteTechnicien {
  technicienId: string;
  creneauxDisponibles: ICreneauHoraire[];
  heuresUtiliseesSemaine: number;
  heuresRestantesSemaine: number;
}

export interface ICreneauHoraire {
  debut: Date;
  fin: Date;
}
