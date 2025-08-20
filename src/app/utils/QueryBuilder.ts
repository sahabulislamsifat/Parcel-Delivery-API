import { Query, FilterQuery } from "mongoose";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;
  private filterObj: FilterQuery<T> = {};

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(fields: string[]) {
    if (this.query.search) {
      const searchFilter = {
        $or: fields.map((field) => ({
          [field]: { $regex: this.query.search as string, $options: "i" },
        })),
      };
      this.filterObj = { ...this.filterObj, ...searchFilter };
      this.modelQuery = this.modelQuery.find(searchFilter);
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

    this.filterObj = { ...this.filterObj, ...queryObj };
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

  getFilter(): FilterQuery<T> {
    return this.filterObj;
  }

  async exec() {
    return await this.modelQuery;
  }
}
