from hbase.admin import HBaseAdmin
from hbase.rest_client import HBaseRESTClient
from hbase.scan_filter_helper import build_prefix_filter


def main():
    client = HBaseRESTClient(["http://localhost:8080"])
    admin = HBaseAdmin(client)

    print(admin.table_schema("book"))

    # scanner_filter = build_single_column_value_filter(
    #     family="details",
    #     qualifier="name",
    #     value="the",
    #     operation="EQUAL",
    #     comparator="SubString",
    #     column=["details"],
    # )

    # scanner_filter = build_row_filter(
    #     "9788368625353",
    #     operation="EQUAL",
    #     comparator="SubString",
    #     column="basic",
    #     startRow="10",
    # )

    scanner_filter = build_prefix_filter(
        "1234567890",
        column="info:basic",
    )

    print(scanner_filter)

    # scanner = Scan(client)
    # result = scanner.scan("book", scanner_filter)
    # print(result)
    # scanner.delete_scanner()


if __name__ == "__main__":
    main()
