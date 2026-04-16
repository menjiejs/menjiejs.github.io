import { initializeDatabase } from './init';
import { getDB } from './init';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // 初始化数据库
    await initializeDatabase();
    const db = getDB();

    // 插入更多示例题目
    const additionalQuestions = [
      {
        id: 'fibonacci',
        title: '斐波那契数列',
        description: '计算斐波那契数列的第n项',
        difficulty: 'C',
        input_format: '一个正整数n',
        output_format: '一个整数，第n项斐波那契数',
        hints: 'F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)',
        template_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (n == 0) {\n        cout << 0;\n        return 0;\n    }\n\n    long long a = 0, b = 1, c;\n    for (int i = 2; i <= n; i++) {\n        c = a + b;\n        a = b;\n        b = c;\n    }\n\n    cout << b;\n    return 0;\n}',
        test_cases: '[{"input": "10", "expectedOutput": "55", "isHidden": false}, {"input": "0", "expectedOutput": "0", "isHidden": false}]',
        memory_limit: 256
      },
      {
        id: 'reverse_string',
        title: '反转字符串',
        description: '将输入的字符串反转',
        difficulty: 'D+',
        input_format: '一个字符串',
        output_format: '反转后的字符串',
        hints: '使用双指针或栈',
        template_code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string str;\n    cin >> str;\n\n    int left = 0, right = str.length() - 1;\n    while (left < right) {\n        swap(str[left], str[right]);\n        left++;\n        right--;\n    }\n\n    cout << str;\n    return 0;\n}',
        test_cases: '[{"input": "hello", "expectedOutput": "olleh", "isHidden": false}]',
        memory_limit: 128
      },
      {
        id: 'bubble_sort',
        title: '冒泡排序',
        description: '对给定的数组进行冒泡排序',
        difficulty: 'C+',
        input_format: '第一行n，第二行n个整数',
        output_format: '排序后的数组',
        hints: '冒泡排序：比较相邻元素并交换',
        template_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    int arr[n];\n    for (int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                swap(arr[j], arr[j + 1]);\n            }\n        }\n    }\n\n    for (int i = 0; i < n; i++) {\n        cout << arr[i];\n        if (i < n - 1) cout << " ";\n    }\n\n    return 0;\n}',
        test_cases: '[{"input": "5\\n5 3 8 1 2", "expectedOutput": "1 2 3 5 8", "isHidden": false}]',
        memory_limit: 256
      },
      {
        id: 'binary_search',
        title: '二分查找',
        description: '在有序数组中查找目标值',
        difficulty: 'B',
        input_format: '第一行n，第二行n个有序整数，第三行目标值',
        output_format: '目标值的索引（未找到返回-1）',
        hints: '二分查找：时间复杂度O(log n)',
        template_code: '#include <iostream>\nusing namespace std;\n\nint binarySearch(int arr[], int n, int target) {\n    int left = 0, right = n - 1;\n\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n\n        if (arr[mid] == target) {\n            return mid;\n        }\n\n        if (arr[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n\n    return -1;\n}\n\nint main() {\n    int n;\n    cin >> n;\n\n    int arr[n];\n    for (int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n\n    int target;\n    cin >> target;\n\n    int result = binarySearch(arr, n, target);\n    cout << result;\n\n    return 0;\n}',
        test_cases: '[{"input": "6\\n1 2 3 4 5 6\\n4", "expectedOutput": "3", "isHidden": false}]',
        memory_limit: 256
      },
      {
        id: 'is_prime',
        title: '判断素数',
        description: '判断一个数是否为素数',
        difficulty: 'B+',
        input_format: '一个正整数n',
        output_format: 'YES或NO',
        hints: '素数：只能被1和自身整除的数',
        template_code: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    if (n == 2) return true;\n    if (n % 2 == 0) return false;\n\n    for (int i = 3; i <= sqrt(n); i += 2) {\n        if (n % i == 0) {\n            return false;\n        }\n    }\n\n    return true;\n}\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (isPrime(n)) {\n        cout << "YES";\n    } else {\n        cout << "NO";\n    }\n\n    return 0;\n}',
        test_cases: '[{"input": "17", "expectedOutput": "YES", "isHidden": false}, {"input": "15", "expectedOutput": "NO", "isHidden": false}]',
        memory_limit: 128
      },
      {
        id: 'gcd_lcm',
        title: '最大公约数和最小公倍数',
        description: '计算两个数的最大公约数和最小公倍数',
        difficulty: 'A',
        input_format: '两个正整数',
        output_format: '最大公约数和最小公倍数，空格分隔',
        hints: 'GCD * LCM = a * b',
        template_code: '#include <iostream>\nusing namespace std;\n\nint gcd(int a, int b) {\n    while (b != 0) {\n        int temp = b;\n        b = a % b;\n        a = temp;\n    }\n    return a;\n}\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n\n    int gcd_result = gcd(a, b);\n    int lcm_result = (a * b) / gcd_result;\n\n    cout << gcd_result << " " << lcm_result;\n\n    return 0;\n}',
        test_cases: '[{"input": "12 18", "expectedOutput": "6 36", "isHidden": false}]',
        memory_limit: 256
      }
    ];

    // 检查题目是否已存在
    const existingQuestions = await db.all('SELECT id FROM questions');
    const existingIds = new Set(existingQuestions.map(q => q.id));

    for (const question of additionalQuestions) {
      if (!existingIds.has(question.id)) {
        await db.run(
          `INSERT INTO questions (
            id, title, description, difficulty, input_format, output_format,
            hints, template_code, test_cases, memory_limit, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            question.id,
            question.title,
            question.description,
            question.difficulty,
            question.input_format,
            question.output_format,
            question.hints,
            question.template_code,
            question.test_cases,
            question.memory_limit
          ]
        );
        console.log(`Added question: ${question.title}`);
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// 运行种子脚本
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };