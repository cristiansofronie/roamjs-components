type QBBase = { uid: string };

export type QBClauseData = {
  relation: string;
  source: string;
  target: string;
  //@deprecated
  not?: boolean;
} & QBBase;
export type QBNestedData = { conditions: Condition[] } & QBBase;

export type QBClause = QBClauseData & { type: "clause" };
export type QBNot = QBClauseData & { type: "not" };

export type QBOr = QBNestedData & {
  type: "or";
};
export type QBNor = QBNestedData & {
  type: "not or";
};

export type Condition = QBClause | QBNot | QBOr | QBNor;

export type Selection = {
  text: string;
  label: string;
  uid: string;
};

export type Result = { text: string; uid: string } & Record<
  string,
  string | number | Date
>;
