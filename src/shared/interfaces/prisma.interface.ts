export interface DBErrors {
    code:          string;
    meta:          Meta;
    clientVersion: string;
    name:          string;
}

export interface Meta {
    modelName:          string;
    driverAdapterError: DriverAdapterError;
}

export interface DriverAdapterError {
    name:  string;
    cause: Cause;
}

export interface Cause {
    originalCode:    string;
    originalMessage: string;
    kind:            string;
    constraint:      Constraint;
}

export interface Constraint {
    fields: string[];
}
