import pandas as pd

FIELD_SEPARATOR = "@@@"


def main():
    data = pd.read_csv("./clean_books.csv")

    data["numOfPage"] = data["numOfPage"].fillna(0)

    data["numOfPage"] = data["numOfPage"].astype("int").astype("string")
    data["published_year"] = data["published_year"].astype("string")

    data['sellPrice'] = data['sellPrice'].str.replace(',', '') \
        .str.pad(width=10, fillchar='0')

    data.to_csv("./books_hbase.csv", header=False, index=False, sep="|")
    return


if __name__ == "__main__":
    main()
