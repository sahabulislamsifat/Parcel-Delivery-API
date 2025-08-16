import { Query } from "mongoose";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(fields: string[]) {
    if (this.query.search) {
      this.modelQuery = this.modelQuery.find({
        $or: fields.map((field) => ({
          [field]: { $regex: this.query.search as string, $options: "i" },
        })),
      });
    }
    return this;
  }

  filter() {
    const excludeFields = ["search", "sortBy", "sortOrder", "limit", "page"];
    const queryObj = Object.keys(this.query).reduce((acc, key) => {
      if (!excludeFields.includes(key)) {
        acc[key] = this.query[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    this.modelQuery = this.modelQuery.find(queryObj);
    return this;
  }

  sort() {
    const sortBy = (this.query.sortBy as string) || "createdAt";
    const sortOrder = (this.query.sortOrder as string) === "asc" ? "" : "-";
    this.modelQuery = this.modelQuery.sort(sortOrder + sortBy);
    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  async exec() {
    return await this.modelQuery;
  }
}
